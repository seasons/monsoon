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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const prisma_1 = require("../../prisma");
const slugify_1 = __importDefault(require("slugify"));
const lodash_1 = require("lodash");
exports.syncProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const allBrands = yield utils_1.getAllBrands();
    const allProducts = yield utils_1.getAllProducts();
    const allCategories = yield utils_1.getAllCategories();
    let i = 1;
    for (const record of allProducts) {
        try {
            const { model } = record;
            const { name } = model;
            const brand = allBrands.findByIds(model.brand);
            const category = allCategories.findByIds(model.category);
            if (lodash_1.isEmpty(model) ||
                lodash_1.isEmpty(name) ||
                lodash_1.isEmpty(brand) ||
                lodash_1.isEmpty(category)) {
                continue;
            }
            const { color, description, images, availableSizes, modelSize, modelHeight, externalURL, tags, retailPrice, innerMaterials, outerMaterials, status, } = model;
            const slug = slugify_1.default(name + " " + color).toLowerCase();
            const data = {
                brand: {
                    connect: {
                        slug: brand.model.slug,
                    },
                },
                category: {
                    connect: {
                        slug: category.model.slug,
                    },
                },
                color: {
                    connect: {
                        slug: slugify_1.default(color).toLowerCase(),
                    },
                },
                availableSizes: {
                    set: availableSizes,
                },
                innerMaterials: {
                    set: (innerMaterials || []).map(a => a.replace(/\ /g, "")),
                },
                outerMaterials: {
                    set: (outerMaterials || []).map(a => a.replace(/\ /g, "")),
                },
                tags: {
                    set: tags,
                },
                name,
                slug,
                description,
                images,
                retailPrice,
                externalURL,
                modelSize,
                modelHeight: (_a = lodash_1.head(modelHeight), (_a !== null && _a !== void 0 ? _a : 0)),
                status: (status || "Available").replace(" ", ""),
            };
            const product = yield prisma_1.prisma.upsertProduct({
                where: {
                    slug,
                },
                create: data,
                update: data,
            });
            yield record.patchUpdate({
                Slug: slug,
            });
            console.log(i++, product);
        }
        catch (e) {
            console.error(e);
        }
    }
});
//# sourceMappingURL=syncProducts.js.map