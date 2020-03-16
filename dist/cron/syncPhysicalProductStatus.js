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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../airtable/utils");
var prisma_1 = require("../prisma");
var updateProductVariantCounts_1 = require("../airtable/updateProductVariantCounts");
var utils_2 = require("../utils");
var Sentry = __importStar(require("@sentry/node"));
var shouldReportErrorsToSentry = process.env.NODE_ENV === "production";
if (shouldReportErrorsToSentry) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
    });
}
function syncPhysicalProductStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var updatedPhysicalProducts, updatedProductVariants, errors, physicalProductsInAirtableButNotPrisma, allAirtablePhysicalProducts, _loop_1, _i, allAirtablePhysicalProducts_1, airtablePhysicalProduct;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    updatedPhysicalProducts = [];
                    updatedProductVariants = [];
                    errors = [];
                    physicalProductsInAirtableButNotPrisma = [];
                    return [4 /*yield*/, utils_1.getAllPhysicalProducts()
                        // Update relevant products
                    ];
                case 1:
                    allAirtablePhysicalProducts = _a.sent();
                    _loop_1 = function (airtablePhysicalProduct) {
                        var prismaPhysicalProduct, newStatusOnAirtable, currentStatusOnPrisma, prismaProductVariantID, prismaProductVariant, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 11, , 12]);
                                    if (shouldReportErrorsToSentry) {
                                        Sentry.configureScope(function (scope) {
                                            scope.setExtra("physicalProductSUID", airtablePhysicalProduct.fields.SUID.text);
                                        });
                                    }
                                    return [4 /*yield*/, prisma_1.prisma.physicalProduct({
                                            seasonsUID: airtablePhysicalProduct.fields.SUID.text,
                                        })];
                                case 1:
                                    prismaPhysicalProduct = _a.sent();
                                    if (!!!prismaPhysicalProduct) return [3 /*break*/, 9];
                                    newStatusOnAirtable = airtablePhysicalProduct.fields["Inventory Status"];
                                    currentStatusOnPrisma = prismaPhysicalProduct.inventoryStatus;
                                    if (!physicalProductStatusChanged(newStatusOnAirtable, currentStatusOnPrisma)) return [3 /*break*/, 8];
                                    // Pause a second, to avoid hitting the 5 requests/sec airtable rate limit
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })
                                        // Get the associated ProductVariantID, and ProductVariant from prisma
                                    ];
                                case 2:
                                    // Pause a second, to avoid hitting the 5 requests/sec airtable rate limit
                                    _a.sent();
                                    return [4 /*yield*/, prisma_1.prisma
                                            .physicalProduct({ id: prismaPhysicalProduct.id })
                                            .productVariant()
                                            .id()];
                                case 3:
                                    prismaProductVariantID = _a.sent();
                                    return [4 /*yield*/, prisma_1.prisma.productVariant({
                                            id: prismaProductVariantID,
                                        })
                                        // Update the counts on the corresponding product variant in prisma
                                    ];
                                case 4:
                                    prismaProductVariant = _a.sent();
                                    // Update the counts on the corresponding product variant in prisma
                                    return [4 /*yield*/, prisma_1.prisma.updateProductVariant({
                                            data: getUpdatedCounts(prismaProductVariant, currentStatusOnPrisma, newStatusOnAirtable, "prisma"),
                                            where: {
                                                id: prismaProductVariantID,
                                            },
                                        })
                                        // Update the status of the corresponding physical product in prisma
                                    ];
                                case 5:
                                    // Update the counts on the corresponding product variant in prisma
                                    _a.sent();
                                    // Update the status of the corresponding physical product in prisma
                                    return [4 /*yield*/, prisma_1.prisma.updatePhysicalProduct({
                                            data: {
                                                inventoryStatus: utils_2.airtableToPrismaInventoryStatus(newStatusOnAirtable),
                                            },
                                            where: { id: prismaPhysicalProduct.id },
                                        })
                                        // Update the counts on the corresponding product variant in airtable
                                    ];
                                case 6:
                                    // Update the status of the corresponding physical product in prisma
                                    _a.sent();
                                    // Update the counts on the corresponding product variant in airtable
                                    return [4 /*yield*/, updateProductVariantCounts_1.updateProductVariantCounts(airtablePhysicalProduct.fields["Product Variant"][0], getUpdatedCounts(prismaProductVariant, currentStatusOnPrisma, newStatusOnAirtable, "airtable"))
                                        // Store updated ids for reporting
                                    ];
                                case 7:
                                    // Update the counts on the corresponding product variant in airtable
                                    _a.sent();
                                    // Store updated ids for reporting
                                    updatedPhysicalProducts.push(prismaPhysicalProduct.seasonsUID);
                                    updatedProductVariants.push(prismaProductVariant.sku);
                                    _a.label = 8;
                                case 8: return [3 /*break*/, 10];
                                case 9:
                                    physicalProductsInAirtableButNotPrisma.push(airtablePhysicalProduct.fields.SUID);
                                    _a.label = 10;
                                case 10: return [3 /*break*/, 12];
                                case 11:
                                    error_1 = _a.sent();
                                    console.log(airtablePhysicalProduct);
                                    console.log(error_1);
                                    errors.push(error_1);
                                    if (shouldReportErrorsToSentry) {
                                        Sentry.captureException(error_1);
                                    }
                                    return [3 /*break*/, 12];
                                case 12: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, allAirtablePhysicalProducts_1 = allAirtablePhysicalProducts;
                    _a.label = 2;
                case 2:
                    if (!(_i < allAirtablePhysicalProducts_1.length)) return [3 /*break*/, 5];
                    airtablePhysicalProduct = allAirtablePhysicalProducts_1[_i];
                    return [5 /*yield**/, _loop_1(airtablePhysicalProduct)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    // Remove physicalProductSUID from the sentry scope so it doesn't cloud
                    // any errors thrown later
                    if (shouldReportErrorsToSentry) {
                        Sentry.configureScope(function (scope) {
                            scope.setExtra("physicalProductSUID", "");
                        });
                    }
                    return [2 /*return*/, {
                            updatedPhysicalProducts: updatedPhysicalProducts,
                            updatedProductVariants: updatedProductVariants,
                            physicalProductsInAirtableButNotPrisma: physicalProductsInAirtableButNotPrisma,
                            errors: errors,
                        }];
            }
        });
    });
}
exports.syncPhysicalProductStatus = syncPhysicalProductStatus;
function physicalProductStatusChanged(newStatusOnAirtable, currentStatusOnPrisma) {
    return (utils_2.airtableToPrismaInventoryStatus(newStatusOnAirtable) !==
        currentStatusOnPrisma);
}
function getUpdatedCounts(prismaProductVariant, currentStatusOnPrisma, newStatusOnAirtable, format) {
    var prismaCounts = {};
    var airtableCounts = {};
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
    var retVal;
    if (format === "prisma") {
        retVal = prismaCounts;
    }
    if (format === "airtable") {
        retVal = airtableCounts;
    }
    return retVal;
}
//# sourceMappingURL=syncPhysicalProductStatus.js.map