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
const omit_1 = __importDefault(require("lodash/omit"));
const lodash_1 = require("lodash");
exports.syncLocations = () => __awaiter(void 0, void 0, void 0, function* () {
    const allLocations = yield utils_1.getAllLocations();
    for (let record of allLocations) {
        try {
            const { model } = record;
            const { name } = model;
            if (lodash_1.isEmpty(model) || lodash_1.isEmpty(name)) {
                continue;
            }
            let values = omit_1.default(model, [
                "physicalProducts",
                "createdAt",
                "updatedAt",
                "recordID",
                "reservations",
                "reservations2",
                "reservations3",
                "users",
                "users2",
            ]);
            values = Object.assign(Object.assign({}, values), { slug: slugify_1.default(values.name + Date.now() / 1000).toLowerCase() });
            const location = yield prisma_1.prisma.upsertLocation({
                where: {
                    slug: values.slug,
                },
                create: values,
                update: values,
            });
            yield record.patchUpdate({
                Slug: values.slug,
            });
        }
        catch (e) {
            console.error(e);
        }
    }
});
//# sourceMappingURL=syncLocations.js.map