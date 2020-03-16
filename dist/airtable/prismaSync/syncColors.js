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
const utils_1 = require("../utils");
const lodash_1 = require("lodash");
exports.syncColors = () => __awaiter(void 0, void 0, void 0, function* () {
    const records = yield utils_1.getAllColors();
    for (let record of records) {
        try {
            const { model } = record;
            const { name, colorCode, rGB } = model;
            if (lodash_1.isEmpty(model) || lodash_1.isEmpty(name)) {
                continue;
            }
            const slug = slugify_1.default(name).toLowerCase();
            const data = {
                colorCode,
                hexCode: rGB,
                name,
                slug,
            };
            const color = yield prisma_1.prisma.upsertColor({
                where: {
                    slug,
                },
                create: data,
                update: data,
            });
            yield record.patchUpdate({
                Slug: slug,
            });
            console.log(color);
        }
        catch (e) {
            console.error(e);
        }
    }
});
//# sourceMappingURL=syncColors.js.map