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
const utils_2 = require("../../utils");
const config_1 = require("../config");
const lodash_1 = require("lodash");
const SeasonsLocationID = "recvzTcW19kdBPqf4";
exports.syncProductVariants = () => __awaiter(void 0, void 0, void 0, function* () {
    const allBrands = yield utils_1.getAllBrands();
    const allColors = yield utils_1.getAllColors();
    const allProducts = yield utils_1.getAllProducts();
    const allLocations = yield utils_1.getAllLocations();
    const allProductVariants = yield utils_1.getAllProductVariants();
    const allPhysicalProducts = yield utils_1.getAllPhysicalProducts();
    for (const productVariant of allProductVariants) {
        try {
            const { model } = productVariant;
            const product = allProducts.findByIds(model.product);
            const brand = allBrands.findByIds(product.model.brand);
            const color = allColors.find(x => x.model.name === product.model.color);
            const location = allLocations.find(x => x.id === SeasonsLocationID);
            const styleNumber = product.model.styleCode;
            if (lodash_1.isEmpty(model) || lodash_1.isEmpty(brand) || lodash_1.isEmpty(product)) {
                continue;
            }
            const sku = skuForData(brand, color, productVariant, styleNumber);
            const { totalCount, nonReservableCount, reservedCount, updatedReservableCount, } = countsForVariant(productVariant);
            const { weight, height, size } = model;
            let data = {
                sku,
                size,
                weight: parseFloat(weight) || 0,
                height: parseFloat(height) || 0,
                total: totalCount,
                reservable: updatedReservableCount,
                reserved: reservedCount,
                nonReservable: nonReservableCount,
                color: {
                    connect: {
                        slug: color.model.slug,
                    },
                },
                product: {
                    connect: {
                        slug: product.model.slug,
                    },
                },
                productID: product.model.slug,
            };
            const productVariantData = yield prisma_1.prisma.upsertProductVariant({
                where: {
                    sku: sku,
                },
                create: Object.assign({}, data),
                update: Object.assign({}, data),
            });
            console.log(productVariantData);
            // Figure out if we need to create new instance of physical products
            // based on the counts and what's available in the database
            const physicalProducts = allPhysicalProducts.filter(a => (a.get("Product Variant") || []).includes(productVariant.id));
            const newPhysicalProducts = yield createMorePhysicalProductsIfNeeded({
                sku,
                location,
                product,
                productVariant,
                physicalProducts,
                totalCount,
            });
            newPhysicalProducts.forEach((p) => __awaiter(void 0, void 0, void 0, function* () {
                const updatePhysicalProduct = yield prisma_1.prisma.upsertPhysicalProduct({
                    where: {
                        seasonsUID: p.seasonsUID,
                    },
                    create: p,
                    update: p,
                });
                console.log(updatePhysicalProduct);
            }));
            yield productVariant.patchUpdate({
                SKU: sku,
                "Total Count": totalCount,
                "Reservable Count": updatedReservableCount,
                "Reserved Count": reservedCount,
                "Non-Reservable Count": nonReservableCount,
            });
        }
        catch (e) {
            console.error(e);
        }
    }
});
const skuForData = (brand, color, productVariant, styleNumber) => {
    let brandCode = brand.get("Brand Code");
    let colorCode = color.get("Color Code");
    let size = productVariant.get("Size");
    let sizeCode = utils_2.sizeToSizeCode(size);
    let styleCode = styleNumber.toString().padStart(3, "0");
    return `${brandCode}-${colorCode}-${sizeCode}-${styleCode}`;
};
const countsForVariant = productVariant => {
    let data = {
        totalCount: productVariant.get("Total Count") || 0,
        reservedCount: productVariant.get("Reserved Count") || 0,
        nonReservableCount: productVariant.get("Non-Reservable Count") || 0,
    };
    return Object.assign(Object.assign({}, data), { updatedReservableCount: data.totalCount - data.reservedCount });
};
const createMorePhysicalProductsIfNeeded = ({ sku, location, productVariant, product, physicalProducts, totalCount, }) => __awaiter(void 0, void 0, void 0, function* () {
    const physicalProductCount = physicalProducts.length;
    const newPhysicalProducts = [];
    // We need to create more physical products
    if (physicalProductCount < totalCount) {
        for (let i = 1; i <= totalCount - physicalProductCount; i++) {
            const physicalProductID = (physicalProductCount + i)
                .toString()
                .padStart(2, "0");
            newPhysicalProducts.push({
                fields: {
                    SUID: {
                        text: sku + `-${physicalProductID}`,
                    },
                    Product: [product.id],
                    Location: [SeasonsLocationID],
                    "Product Variant": [productVariant.id],
                    "Inventory Status": "Non Reservable",
                    "Product Status": "New",
                },
            });
        }
        yield config_1.base("Physical Products").create(newPhysicalProducts);
    }
    return newPhysicalProducts.map(({ fields }) => ({
        seasonsUID: fields.SUID.text,
        productVariant: {
            connect: {
                sku,
            },
        },
        location: {
            connect: {
                slug: location.model.slug,
            },
        },
        inventoryStatus: "Reservable",
        productStatus: fields["Product Status"],
    }));
});
//# sourceMappingURL=syncProductVariants.js.map