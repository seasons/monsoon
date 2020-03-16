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
exports.syncBrands = () => __awaiter(void 0, void 0, void 0, function* () {
    const records = yield utils_1.getAllBrands();
    for (let record of records) {
        try {
            const { model } = record;
            const { name, brandCode, description, website, logo, since, primary, tier, } = model;
            if (lodash_1.isEmpty(model) || lodash_1.isEmpty(name)) {
                continue;
            }
            const slug = slugify_1.default(name).toLowerCase();
            const data = {
                slug,
                name,
                tier: (tier || "").replace(" ", ""),
                websiteUrl: website,
                logo,
                description,
                since: since ? `${since}-01-01` : "2019-01-01",
                isPrimaryBrand: primary,
                brandCode,
            };
            const brand = yield prisma_1.prisma.upsertBrand({
                where: {
                    slug,
                },
                create: Object.assign({ slug }, data),
                update: data,
            });
            yield record.patchUpdate({
                Slug: slug,
            });
            console.log(brand);
        }
        catch (e) {
            console.error(e);
        }
    }
});
//# sourceMappingURL=syncBrands.js.map