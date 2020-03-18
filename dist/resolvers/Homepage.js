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
var utils_1 = require("../auth/utils");
// FIXME: This is being used because currently info is lacking the __typename, add __typename to info
var ProductFragment = "\n{\n  __typename\n  id\n  slug\n  images\n  name\n  brand {\n    id\n    name\n  }\n  variants {\n    id\n    reservable\n    internalSize {\n      top {\n        letter\n      }\n      bottom {\n        type\n        value\n      }\n      productType\n      display\n    }\n  }\n  color {\n    name\n  }\n  retailPrice\n}\n";
exports.HomepageResult = {
    __resolveType: function (obj, _context, _info) {
        if (obj.brand || obj.colorway) {
            return "Product";
        }
        else if (obj.since) {
            return "Brand";
        }
        else if (obj.subTitle) {
            return "Collection";
        }
        else if (obj.name) {
            return "HomepageProductRail";
        }
        else {
            return null;
        }
    },
};
exports.Homepage = function (parent, args, ctx, info) { return __awaiter(void 0, void 0, void 0, function () {
    var customer, error_1, productRails, homepageSections;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, utils_1.getCustomerFromContext(ctx)];
            case 1:
                customer = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.log("Customer is not logged in", error_1);
                return [3 /*break*/, 3];
            case 3: return [4 /*yield*/, ctx.db.query.homepageProductRails({}, "{\n      __typename\n      id\n      name\n      products {\n        id\n      }\n    }")];
            case 4:
                productRails = _a.sent();
                homepageSections = {
                    sections: [
                        {
                            type: "CollectionGroups",
                            __typename: "HomepageSection",
                            title: "Featured collection",
                            results: function (args, ctx, info) { return __awaiter(void 0, void 0, void 0, function () {
                                var collections;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, ctx.prisma
                                                .collectionGroup({ slug: "homepage-1" })
                                                .collections()];
                                        case 1:
                                            collections = _a.sent();
                                            return [2 /*return*/, collections];
                                    }
                                });
                            }); },
                        },
                        {
                            type: "Products",
                            __typename: "HomepageSection",
                            title: "Just added",
                            results: function (args, ctx, localInfo) { return __awaiter(void 0, void 0, void 0, function () {
                                var newProducts;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, ctx.db.query.products(__assign(__assign({}, args), { orderBy: "createdAt_DESC", first: 8, where: {
                                                    status: "Available",
                                                } }), ProductFragment)];
                                        case 1:
                                            newProducts = _a.sent();
                                            return [2 /*return*/, newProducts];
                                    }
                                });
                            }); },
                        },
                        {
                            type: "Brands",
                            __typename: "HomepageSection",
                            title: "Designers",
                            results: function (args, ctx, info) { return __awaiter(void 0, void 0, void 0, function () {
                                var brands;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, ctx.db.query.brands(__assign(__assign({}, args), { where: {
                                                    slug_in: [
                                                        "acne-studios",
                                                        "stone-island",
                                                        "stussy",
                                                        "comme-des-garcons",
                                                        "aime-leon-dore",
                                                        "noah",
                                                        "cavempt",
                                                        "brain-dead",
                                                        "john-elliot",
                                                        "amiri",
                                                        "prada",
                                                        "craig-green",
                                                        "dries-van-noten",
                                                        "cactus-plant-flea-market",
                                                        "ambush",
                                                        "all-saints",
                                                        "heron-preston",
                                                        "saturdays-nyc",
                                                        "y-3",
                                                        "our-legacy",
                                                    ],
                                                } }), "{\n              __typename\n              id\n              name\n              since\n            }")];
                                        case 1:
                                            brands = _a.sent();
                                            return [2 /*return*/, brands];
                                    }
                                });
                            }); },
                        },
                    ],
                };
                if (customer) {
                    homepageSections.sections.push({
                        type: "Products",
                        __typename: "HomepageSection",
                        title: "Recently viewed",
                        results: function (args, ctx, localInfo) { return __awaiter(void 0, void 0, void 0, function () {
                            var viewedProducts;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, ctx.db.query.recentlyViewedProducts({
                                            where: { customer: { id: customer.id } },
                                            orderBy: "updatedAt_DESC",
                                            limit: 10,
                                        }, "{\n            updatedAt\n            product " + ProductFragment + "\n          }")];
                                    case 1:
                                        viewedProducts = _a.sent();
                                        return [2 /*return*/, viewedProducts.map(function (viewedProduct) { return viewedProduct.product; })];
                                }
                            });
                        }); },
                    });
                }
                productRails.forEach(function (rail) {
                    homepageSections.sections.push({
                        type: "HomepageProductRails",
                        __typename: "HomepageSection",
                        title: rail.name,
                        results: function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, ctx.db.query.products({
                                            where: {
                                                id_in: rail.products.map(function (product) {
                                                    return product.id;
                                                }),
                                            },
                                        }, ProductFragment)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); },
                    });
                });
                return [2 /*return*/, homepageSections];
        }
    });
}); };
//# sourceMappingURL=Homepage.js.map