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
const utils_1 = require("../utils");
const prisma_1 = require("../../prisma");
const lodash_1 = require("lodash");
exports.syncPhysicalProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    const allLocations = yield utils_1.getAllLocations();
    const allProductVariants = yield utils_1.getAllProductVariants();
    const allPhysicalProducts = yield utils_1.getAllPhysicalProducts();
    let i = 1;
    for (const record of allPhysicalProducts) {
        try {
            const { model } = record;
            const productVariant = allProductVariants.findByIds(model.productVariant);
            const location = allLocations.findByIds(model.location);
            if (lodash_1.isEmpty(model)) {
                continue;
            }
            const { sUID, inventoryStatus, productStatus } = model;
            const data = {
                productVariant: {
                    connect: {
                        sku: productVariant.model.sKU,
                    },
                },
                location: {
                    connect: {
                        slug: location.model.slug,
                    },
                },
                seasonsUID: sUID.text,
                inventoryStatus: inventoryStatus.replace(" ", ""),
                productStatus,
            };
            const physicalProduct = yield prisma_1.prisma.upsertPhysicalProduct({
                where: {
                    seasonsUID: sUID.text,
                },
                create: data,
                update: data,
            });
        }
        catch (e) {
            console.error(e);
            break;
        }
    }
});
//# sourceMappingURL=syncPhysicalProducts.js.map