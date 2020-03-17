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
var utils_1 = require("../../auth/utils");
var lodash_1 = require("lodash");
var apollo_server_1 = require("apollo-server");
var BAG_SIZE = 3;
exports.bag = {
    addToBag: function (obj, _a, ctx, info) {
        var item = _a.item;
        return __awaiter(this, void 0, void 0, function () {
            var customer, bag;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, utils_1.getCustomerFromContext(ctx)
                        // Check if the user still can add more items to bag
                        // If not throw error
                        // Check if the bag item already exists
                        // Upsert it instead
                    ];
                    case 1:
                        customer = _b.sent();
                        return [4 /*yield*/, ctx.prisma.bagItems({
                                where: {
                                    customer: {
                                        id: customer.id,
                                    },
                                    saved: false,
                                },
                            })];
                    case 2:
                        bag = _b.sent();
                        if (bag.length >= BAG_SIZE) {
                            throw new apollo_server_1.ApolloError("Bag is full", "514");
                        }
                        return [4 /*yield*/, ctx.prisma.createBagItem({
                                customer: {
                                    connect: {
                                        id: customer.id,
                                    },
                                },
                                productVariant: {
                                    connect: {
                                        id: item,
                                    },
                                },
                                position: 0,
                                saved: false,
                                status: "Added",
                            })];
                    case 3: return [2 /*return*/, _b.sent()];
                }
            });
        });
    },
    removeFromBag: function (obj, _a, ctx, info) {
        var item = _a.item, saved = _a.saved;
        return __awaiter(this, void 0, void 0, function () {
            var customer, whereData, bagItems, bagItem;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, utils_1.getCustomerFromContext(ctx)];
                    case 1:
                        customer = _b.sent();
                        whereData = {
                            customer: {
                                id: customer.id,
                            },
                            productVariant: {
                                id: item,
                            },
                        };
                        if (typeof saved === "boolean") {
                            whereData.saved = saved;
                        }
                        return [4 /*yield*/, ctx.prisma.bagItems({
                                where: whereData,
                            })];
                    case 2:
                        bagItems = _b.sent();
                        bagItem = lodash_1.head(bagItems);
                        if (!bagItem) {
                            throw new apollo_server_1.ApolloError("Item can not be found", "514");
                        }
                        return [4 /*yield*/, ctx.prisma.deleteBagItem({
                                id: bagItem.id,
                            })];
                    case 3: return [2 /*return*/, _b.sent()];
                }
            });
        });
    },
    saveProduct: function (obj, _a, ctx, info) {
        var item = _a.item, _b = _a.save, save = _b === void 0 ? false : _b;
        return __awaiter(this, void 0, void 0, function () {
            var customer, bagItems, bagItem;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, utils_1.getCustomerFromContext(ctx)];
                    case 1:
                        customer = _c.sent();
                        return [4 /*yield*/, ctx.db.query.bagItems({
                                where: {
                                    customer: {
                                        id: customer.id,
                                    },
                                    productVariant: {
                                        id: item,
                                    },
                                    saved: true,
                                },
                            }, info)];
                    case 2:
                        bagItems = _c.sent();
                        bagItem = lodash_1.head(bagItems);
                        if (!(save && !bagItem)) return [3 /*break*/, 4];
                        return [4 /*yield*/, ctx.prisma.createBagItem({
                                customer: {
                                    connect: {
                                        id: customer.id,
                                    },
                                },
                                productVariant: {
                                    connect: {
                                        id: item,
                                    },
                                },
                                position: 0,
                                saved: save,
                                status: "Added",
                            })];
                    case 3:
                        bagItem = _c.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        if (!bagItem) return [3 /*break*/, 6];
                        return [4 /*yield*/, ctx.prisma.deleteBagItem({
                                id: bagItem.id,
                            })];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        if (save) {
                            return [2 /*return*/, ctx.db.query.bagItem({
                                    where: {
                                        id: bagItem.id,
                                    },
                                }, info)];
                        }
                        return [2 /*return*/, bagItem];
                }
            });
        });
    },
};
//# sourceMappingURL=bag.js.map