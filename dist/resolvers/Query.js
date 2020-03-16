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
const Homepage_1 = require("./Homepage");
const Faq_1 = require("./Faq");
const utils_1 = require("../auth/utils");
const Payment_1 = require("./Payment");
const Search_1 = require("./Search");
const Products_1 = require("./Products");
exports.Query = Object.assign(Object.assign(Object.assign(Object.assign({}, Products_1.Products), { me(parent, args, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = yield utils_1.getUserRequestObject(ctx);
            return ctx.prisma.user({ id });
        });
    }, brand: (parent, args, ctx, info) => ctx.db.query.brand(args, info), brands: (parent, args, ctx, info) => __awaiter(void 0, void 0, void 0, function* () {
        const brands = yield ctx.db.query.brands(args, info);
        const brandsWithProducts = brands.filter(brand => {
            var _a, _b;
            return ((_b = (_a = brand) === null || _a === void 0 ? void 0 : _a.products) === null || _b === void 0 ? void 0 : _b.length) > 0;
        });
        return brandsWithProducts;
    }), product: (parent, args, ctx, info) => ctx.db.query.product(args, info), productRequests: (parent, args, ctx, info) => ctx.db.query.productRequests(args, info), collections: (parent, args, ctx, info) => ctx.db.query.collections(args, info), collection: (parent, args, ctx, info) => ctx.db.query.collection(args, info), productFunctions: (parent, args, ctx, info) => ctx.db.query.productFunctions(args, info), categories: (parent, args, ctx, info) => ctx.db.query.categories(args, info), homepageProductRails: (parent, args, ctx, info) => ctx.db.query.homepageProductRails(args, info), homepageProductRail: (parent, args, ctx, info) => ctx.db.query.homepageProductRail(args, info), homepage: Homepage_1.Homepage, faq: Faq_1.Faq }), Search_1.Search), Payment_1.Payment);
//# sourceMappingURL=Query.js.map