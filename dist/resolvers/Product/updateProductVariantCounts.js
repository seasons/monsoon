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
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const apollo_server_1 = require("apollo-server");
const utils_2 = require("../../airtable/utils");
/* Returns back [ProductsBeingReserved, PhysicalProductsBeingReserved, RollbackFunc] */
exports.updateProductVariantCounts = (
/* array of product variant ids */
items, ctx, { dryRun } = { dryRun: false }) => __awaiter(void 0, void 0, void 0, function* () {
    const prismaProductVariants = yield ctx.prisma.productVariants({
        where: { id_in: items },
    });
    const physicalProducts = yield utils_1.getPhysicalProductsWithReservationSpecificData(ctx, items);
    // Are there any unavailable variants? If so, throw an error
    const unavailableVariants = prismaProductVariants.filter(v => v.reservable <= 0);
    if (unavailableVariants.length > 0) {
        // Remove items in the bag that are not available anymore
        yield ctx.prisma.deleteManyBagItems({
            productVariant: {
                id_in: unavailableVariants.map(a => a.id),
            },
            saved: false,
            status: "Added",
        });
        throw new apollo_server_1.ApolloError("The following item is not reservable", "511", unavailableVariants);
    }
    // Double check that the product variants have a sufficient number of available
    // physical products
    const availablePhysicalProducts = utils_1.extractUniqueReservablePhysicalProducts(physicalProducts);
    if (availablePhysicalProducts.length < items.length) {
        // TODO: list out unavailable items
        throw new apollo_server_1.ApolloError("One or more product variants does not have an available physical product", "515");
    }
    // Get the corresponding product variant records from airtable
    const allAirtableProductVariants = yield utils_2.getAllProductVariants();
    const allAirtableProductVariantSlugs = prismaProductVariants.map(a => a.sku);
    const airtableProductVariants = allAirtableProductVariants.filter(a => allAirtableProductVariantSlugs.includes(a.model.sKU));
    const productsBeingReserved = [];
    const rollbackFuncs = [];
    try {
        for (const prismaProductVariant of prismaProductVariants) {
            const iProduct = yield ctx.prisma
                .productVariant({ id: prismaProductVariant.id })
                .product();
            productsBeingReserved.push(iProduct);
            // Update product variant counts in prisma and airtable
            if (!dryRun) {
                const data = {
                    reservable: prismaProductVariant.reservable - 1,
                    reserved: prismaProductVariant.reserved + 1,
                };
                const rollbackData = {
                    reservable: prismaProductVariant.reservable,
                    reserved: prismaProductVariant.reserved,
                };
                yield ctx.prisma.updateProductVariant({
                    where: {
                        id: prismaProductVariant.id,
                    },
                    data,
                });
                const rollbackPrismaProductVariantUpdate = () => __awaiter(void 0, void 0, void 0, function* () {
                    yield ctx.prisma.updateProductVariant({
                        where: {
                            id: prismaProductVariant.id,
                        },
                        data: rollbackData,
                    });
                });
                rollbackFuncs.push(rollbackPrismaProductVariantUpdate);
                // Airtable record of product variant
                const airtableProductVariant = airtableProductVariants.find(a => a.model.sKU === prismaProductVariant.sku);
                if (airtableProductVariant) {
                    yield airtableProductVariant.patchUpdate({
                        "Reservable Count": data.reservable,
                        "Reserved Count": data.reserved,
                    });
                    const rollbackAirtableProductVariantUpdate = () => __awaiter(void 0, void 0, void 0, function* () {
                        yield airtableProductVariant.patchUpdate({
                            "Reservable Count": rollbackData.reservable,
                            "Reserved Count": rollbackData.reserved,
                        });
                    });
                    rollbackFuncs.push(rollbackAirtableProductVariantUpdate);
                }
            }
        }
    }
    catch (err) {
        for (const rollbackFunc of rollbackFuncs) {
            yield rollbackFunc();
        }
        throw err;
    }
    const rollbackProductVariantCounts = () => __awaiter(void 0, void 0, void 0, function* () {
        for (const rollbackFunc of rollbackFuncs) {
            yield rollbackFunc();
        }
    });
    return [
        productsBeingReserved,
        availablePhysicalProducts,
        rollbackProductVariantCounts,
    ];
});
//# sourceMappingURL=updateProductVariantCounts.js.map