"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Products = {
    products: function (parent, args, ctx, info) { return __awaiter(void 0, void 0, void 0, function () {
        var queryOptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, queryOptionsForProducts(args, ctx)];
                case 1:
                    queryOptions = _a.sent();
                    return [4 /*yield*/, ctx.db.query.products(__assign(__assign({}, args), queryOptions), info)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); },
    productsConnection: function (parent, args, ctx, info) { return __awaiter(void 0, void 0, void 0, function () {
        var queryOptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, queryOptionsForProducts(args, ctx)];
                case 1:
                    queryOptions = _a.sent();
                    return [4 /*yield*/, ctx.db.query.productsConnection(__assign(__assign({}, args), queryOptions), info)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); },
};
var queryOptionsForProducts = function (args, ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var category, orderBy, sizes, where, filters;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                category = args.category || "all";
                orderBy = args.orderBy || "createdAt_DESC";
                sizes = args.sizes || [];
                where = args.where || {};
                if (sizes && sizes.length > 0) {
                    where.variants_some = { size_in: sizes };
                }
                if (!orderBy.includes("name_")) return [3 /*break*/, 2];
                return [4 /*yield*/, productsAlphabetically(ctx, category, orderBy, sizes)];
            case 1: return [2 /*return*/, _a.sent()];
            case 2: return [4 /*yield*/, filtersForCategory(ctx, args)];
            case 3:
                filters = _a.sent();
                return [2 /*return*/, __assign({ orderBy: orderBy,
                        where: where }, filters)];
        }
    });
}); };
var filtersForCategory = function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
    var category, children;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(args.category && args.category !== "all")) return [3 /*break*/, 3];
                return [4 /*yield*/, ctx.prisma.category({ slug: args.category })];
            case 1:
                category = _a.sent();
                return [4 /*yield*/, ctx.prisma
                        .category({ slug: args.category })
                        .children()];
            case 2:
                children = _a.sent();
                return [2 /*return*/, children.length > 0
                        ? {
                            where: __assign(__assign({}, args.where), { OR: children.map(function (_a) {
                                    var slug = _a.slug;
                                    return ({ category: { slug: slug } });
                                }) }),
                        }
                        : {
                            where: __assign(__assign({}, args.where), { category: { slug: category.slug } }),
                        }];
            case 3: return [2 /*return*/, {}];
        }
    });
}); };
var productsAlphabetically = function (ctx, category, orderBy, sizes) { return __awaiter(void 0, void 0, void 0, function () {
    var brands, products;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.db.query.brands({ orderBy: orderBy }, "\n      {\n        name\n        products(\n          orderBy: name_ASC, \n          where: {\n            " + (category !== "all" ? "category: { slug: \"" + category + "\" }," : "") + "\n            status: Available,\n            variants_some: { size_in: [" + sizes + "] }\n          }\n        ) {\n          id\n          name\n          description\n          images\n          modelSize\n          modelHeight\n          externalURL\n          tags\n          retailPrice\n          status\n          createdAt\n          updatedAt\n          brand {\n            id\n            name\n          }\n          variants {\n            id\n            size\n            total\n            reservable\n            nonReservable\n            reserved\n          }\n        }\n      }\n      ")];
            case 1:
                brands = _a.sent();
                products = brands.map(function (b) { return b.products; }).flat();
                return [2 /*return*/, products];
        }
    });
}); };
//# sourceMappingURL=Products.js.map