"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../airtable/utils");
const prisma_1 = require("../prisma");
const updateProductVariantCounts_1 = require("../airtable/updateProductVariantCounts");
const utils_2 = require("../utils");
const Sentry = __importStar(require("@sentry/node"));
const shouldReportErrorsToSentry = process.env.NODE_ENV === "production";
if (shouldReportErrorsToSentry) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
    });
}
function syncPhysicalProductStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get relevant data for airtable, setup containers to hold return data
        const updatedPhysicalProducts = [];
        const updatedProductVariants = [];
        const errors = [];
        const physicalProductsInAirtableButNotPrisma = [];
        const allAirtablePhysicalProducts = yield utils_1.getAllPhysicalProducts();
        // Update relevant products
        for (const airtablePhysicalProduct of allAirtablePhysicalProducts) {
            // Wrap it in a try/catch so individual sync errors don't stop the whole job
            try {
                if (shouldReportErrorsToSentry) {
                    Sentry.configureScope(scope => {
                        scope.setExtra("physicalProductSUID", airtablePhysicalProduct.fields.SUID.text);
                    });
                }
                const prismaPhysicalProduct = yield prisma_1.prisma.physicalProduct({
                    seasonsUID: airtablePhysicalProduct.fields.SUID.text,
                });
                if (!!prismaPhysicalProduct) {
                    const newStatusOnAirtable = airtablePhysicalProduct.fields["Inventory Status"];
                    const currentStatusOnPrisma = prismaPhysicalProduct.inventoryStatus;
                    // If the status has changed, then update prisma and airtable accordingly
                    if (physicalProductStatusChanged(newStatusOnAirtable, currentStatusOnPrisma)) {
                        // Pause a second, to avoid hitting the 5 requests/sec airtable rate limit
                        yield new Promise(resolve => setTimeout(resolve, 1000));
                        // Get the associated ProductVariantID, and ProductVariant from prisma
                        const prismaProductVariantID = yield prisma_1.prisma
                            .physicalProduct({ id: prismaPhysicalProduct.id })
                            .productVariant()
                            .id();
                        const prismaProductVariant = yield prisma_1.prisma.productVariant({
                            id: prismaProductVariantID,
                        });
                        // Update the counts on the corresponding product variant in prisma
                        yield prisma_1.prisma.updateProductVariant({
                            data: getUpdatedCounts(prismaProductVariant, currentStatusOnPrisma, newStatusOnAirtable, "prisma"),
                            where: {
                                id: prismaProductVariantID,
                            },
                        });
                        // Update the status of the corresponding physical product in prisma
                        yield prisma_1.prisma.updatePhysicalProduct({
                            data: {
                                inventoryStatus: utils_2.airtableToPrismaInventoryStatus(newStatusOnAirtable),
                            },
                            where: { id: prismaPhysicalProduct.id },
                        });
                        // Update the counts on the corresponding product variant in airtable
                        yield updateProductVariantCounts_1.updateProductVariantCounts(airtablePhysicalProduct.fields["Product Variant"][0], getUpdatedCounts(prismaProductVariant, currentStatusOnPrisma, newStatusOnAirtable, "airtable"));
                        // Store updated ids for reporting
                        updatedPhysicalProducts.push(prismaPhysicalProduct.seasonsUID);
                        updatedProductVariants.push(prismaProductVariant.sku);
                    }
                }
                else {
                    physicalProductsInAirtableButNotPrisma.push(airtablePhysicalProduct.fields.SUID);
                }
            }
            catch (error) {
                console.log(airtablePhysicalProduct);
                console.log(error);
                errors.push(error);
                if (shouldReportErrorsToSentry) {
                    Sentry.captureException(error);
                }
            }
        }
        // Remove physicalProductSUID from the sentry scope so it doesn't cloud
        // any errors thrown later
        if (shouldReportErrorsToSentry) {
            Sentry.configureScope(scope => {
                scope.setExtra("physicalProductSUID", "");
            });
        }
        return {
            updatedPhysicalProducts,
            updatedProductVariants,
            physicalProductsInAirtableButNotPrisma,
            errors,
        };
    });
}
exports.syncPhysicalProductStatus = syncPhysicalProductStatus;
function physicalProductStatusChanged(newStatusOnAirtable, currentStatusOnPrisma) {
    return (utils_2.airtableToPrismaInventoryStatus(newStatusOnAirtable) !==
        currentStatusOnPrisma);
}
function getUpdatedCounts(prismaProductVariant, currentStatusOnPrisma, newStatusOnAirtable, format) {
    const prismaCounts = {};
    const airtableCounts = {};
    // Decrement the count for whichever status we are moving away from
    switch (currentStatusOnPrisma) {
        case "NonReservable":
            prismaCounts.nonReservable = prismaProductVariant.nonReservable - 1;
            airtableCounts["Non-Reservable Count"] = prismaCounts.nonReservable;
            break;
        case "Reserved":
            prismaCounts.reserved = prismaProductVariant.reserved - 1;
            airtableCounts["Reserved Count"] = prismaCounts.reserved;
            break;
        case "Reservable":
            prismaCounts.reservable = prismaProductVariant.reservable - 1;
            airtableCounts["Reservable Count"] = prismaCounts.reservable;
            break;
    }
    // Increment the count for whichever status we are switching on to
    switch (newStatusOnAirtable) {
        case "Non Reservable":
            prismaCounts.nonReservable = prismaProductVariant.nonReservable + 1;
            airtableCounts["Non-Reservable Count"] = prismaCounts.nonReservable;
            break;
        case "Reserved":
            prismaCounts.reserved = prismaProductVariant.reserved + 1;
            airtableCounts["Reserved Count"] = prismaCounts.reserved;
            break;
        case "Reservable":
            prismaCounts.reservable = prismaProductVariant.reservable + 1;
            airtableCounts["Reservable Count"] = prismaCounts.reservable;
            break;
    }
    // Get the formatting right
    let retVal;
    if (format === "prisma") {
        retVal = prismaCounts;
    }
    if (format === "airtable") {
        retVal = airtableCounts;
    }
    return retVal;
}
//# sourceMappingURL=syncPhysicalProductStatus.js.map