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
exports.syncCollectionGroups = () => __awaiter(void 0, void 0, void 0, function* () {
    const records = yield utils_1.getAllCollectionGroups();
    const allCollections = yield utils_1.getAllCollections();
    for (let record of records) {
        try {
            const { model } = record;
            const collections = allCollections.findMultipleByIds(model.collections);
            const { title } = model;
            if (lodash_1.isEmpty(title)) {
                continue;
            }
            const slug = slugify_1.default(title).toLowerCase();
            const data = {
                collections: {
                    connect: collections.map(collection => {
                        return { slug: collection.model.slug };
                    }),
                },
                collectionCount: collections.length,
                title,
                slug,
            };
            const collectionGroup = yield prisma_1.prisma.upsertCollectionGroup({
                where: {
                    slug,
                },
                create: data,
                update: data,
            });
            yield record.patchUpdate({
                Slug: slug,
            });
            console.log(collectionGroup);
        }
        catch (e) {
            console.error(e);
        }
    }
});
//# sourceMappingURL=syncCollectionGroups.js.map