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
const slugify_1 = __importDefault(require("slugify"));
const prisma_1 = require("../../prisma");
const lodash_1 = require("lodash");
const utils_1 = require("../utils");
exports.syncCollections = () => __awaiter(void 0, void 0, void 0, function* () {
    const records = yield utils_1.getAllCollections();
    const allProducts = yield utils_1.getAllProducts();
    for (let record of records) {
        try {
            const { model } = record;
            const products = allProducts.findMultipleByIds(model.products);
            const { descriptionTop, descriptionBottom, title, subTitle, images, } = model;
            if (lodash_1.isEmpty(images) || lodash_1.isEmpty(title)) {
                continue;
            }
            const slug = slugify_1.default(title).toLowerCase();
            const data = {
                products: {
                    connect: products.map(product => ({ slug: product.model.slug })),
                },
                slug,
                title,
                subTitle,
                descriptionTop,
                descriptionBottom,
                images,
            };
            const collection = yield prisma_1.prisma.upsertCollection({
                where: {
                    slug,
                },
                create: Object.assign({ slug }, data),
                update: data,
            });
            yield record.patchUpdate({
                Slug: slug,
            });
            console.log(collection);
        }
        catch (e) {
            console.error(e);
        }
    }
});
//# sourceMappingURL=syncCollections.js.map