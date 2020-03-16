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
var utils_1 = require("./utils");
var apollo_server_1 = require("apollo-server");
var utils_2 = require("../../airtable/utils");
/* Returns back [ProductsBeingReserved, PhysicalProductsBeingReserved, RollbackFunc] */
exports.updateProductVariantCounts = function (
/* array of product variant ids */
items, ctx, _a) {
    var dryRun = (_a === void 0 ? { dryRun: false } : _a).dryRun;
    return __awaiter(void 0, void 0, void 0, function () {
        var prismaProductVariants, physicalProducts, unavailableVariants, availablePhysicalProducts, allAirtableProductVariants, allAirtableProductVariantSlugs, airtableProductVariants, productsBeingReserved, rollbackFuncs, _loop_1, _i, prismaProductVariants_1, prismaProductVariant, err_1, _b, rollbackFuncs_1, rollbackFunc, rollbackProductVariantCounts;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, ctx.prisma.productVariants({
                        where: { id_in: items },
                    })];
                case 1:
                    prismaProductVariants = _c.sent();
                    return [4 /*yield*/, utils_1.getPhysicalProductsWithReservationSpecificData(ctx, items)
                        // Are there any unavailable variants? If so, throw an error
                    ];
                case 2:
                    physicalProducts = _c.sent();
                    unavailableVariants = prismaProductVariants.filter(function (v) { return v.reservable <= 0; });
                    if (!(unavailableVariants.length > 0)) return [3 /*break*/, 4];
                    // Remove items in the bag that are not available anymore
                    return [4 /*yield*/, ctx.prisma.deleteManyBagItems({
                            productVariant: {
                                id_in: unavailableVariants.map(function (a) { return a.id; }),
                            },
                            saved: false,
                            status: "Added",
                        })];
                case 3:
                    // Remove items in the bag that are not available anymore
                    _c.sent();
                    throw new apollo_server_1.ApolloError("The following item is not reservable", "511", unavailableVariants);
                case 4:
                    availablePhysicalProducts = utils_1.extractUniqueReservablePhysicalProducts(physicalProducts);
                    if (availablePhysicalProducts.length < items.length) {
                        // TODO: list out unavailable items
                        throw new apollo_server_1.ApolloError("One or more product variants does not have an available physical product", "515");
                    }
                    return [4 /*yield*/, utils_2.getAllProductVariants()];
                case 5:
                    allAirtableProductVariants = _c.sent();
                    allAirtableProductVariantSlugs = prismaProductVariants.map(function (a) { return a.sku; });
                    airtableProductVariants = allAirtableProductVariants.filter(function (a) {
                        return allAirtableProductVariantSlugs.includes(a.model.sKU);
                    });
                    productsBeingReserved = [];
                    rollbackFuncs = [];
                    _c.label = 6;
                case 6:
                    _c.trys.push([6, 11, , 16]);
                    _loop_1 = function (prismaProductVariant) {
                        var iProduct, data, rollbackData_1, rollbackPrismaProductVariantUpdate, airtableProductVariant_1, rollbackAirtableProductVariantUpdate;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ctx.prisma
                                        .productVariant({ id: prismaProductVariant.id })
                                        .product()];
                                case 1:
                                    iProduct = _a.sent();
                                    productsBeingReserved.push(iProduct);
                                    if (!!dryRun) return [3 /*break*/, 4];
                                    data = {
                                        reservable: prismaProductVariant.reservable - 1,
                                        reserved: prismaProductVariant.reserved + 1,
                                    };
                                    rollbackData_1 = {
                                        reservable: prismaProductVariant.reservable,
                                        reserved: prismaProductVariant.reserved,
                                    };
                                    return [4 /*yield*/, ctx.prisma.updateProductVariant({
                                            where: {
                                                id: prismaProductVariant.id,
                                            },
                                            data: data,
                                        })];
                                case 2:
                                    _a.sent();
                                    rollbackPrismaProductVariantUpdate = function () { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, ctx.prisma.updateProductVariant({
                                                        where: {
                                                            id: prismaProductVariant.id,
                                                        },
                                                        data: rollbackData_1,
                                                    })];
                                                case 1:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); };
                                    rollbackFuncs.push(rollbackPrismaProductVariantUpdate);
                                    airtableProductVariant_1 = airtableProductVariants.find(function (a) { return a.model.sKU === prismaProductVariant.sku; });
                                    if (!airtableProductVariant_1) return [3 /*break*/, 4];
                                    return [4 /*yield*/, airtableProductVariant_1.patchUpdate({
                                            "Reservable Count": data.reservable,
                                            "Reserved Count": data.reserved,
                                        })];
                                case 3:
                                    _a.sent();
                                    rollbackAirtableProductVariantUpdate = function () { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, airtableProductVariant_1.patchUpdate({
                                                        "Reservable Count": rollbackData_1.reservable,
                                                        "Reserved Count": rollbackData_1.reserved,
                                                    })];
                                                case 1:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); };
                                    rollbackFuncs.push(rollbackAirtableProductVariantUpdate);
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, prismaProductVariants_1 = prismaProductVariants;
                    _c.label = 7;
                case 7:
                    if (!(_i < prismaProductVariants_1.length)) return [3 /*break*/, 10];
                    prismaProductVariant = prismaProductVariants_1[_i];
                    return [5 /*yield**/, _loop_1(prismaProductVariant)];
                case 8:
                    _c.sent();
                    _c.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 7];
                case 10: return [3 /*break*/, 16];
                case 11:
                    err_1 = _c.sent();
                    _b = 0, rollbackFuncs_1 = rollbackFuncs;
                    _c.label = 12;
                case 12:
                    if (!(_b < rollbackFuncs_1.length)) return [3 /*break*/, 15];
                    rollbackFunc = rollbackFuncs_1[_b];
                    return [4 /*yield*/, rollbackFunc()];
                case 13:
                    _c.sent();
                    _c.label = 14;
                case 14:
                    _b++;
                    return [3 /*break*/, 12];
                case 15: throw err_1;
                case 16:
                    rollbackProductVariantCounts = function () { return __awaiter(void 0, void 0, void 0, function () {
                        var _i, rollbackFuncs_2, rollbackFunc;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _i = 0, rollbackFuncs_2 = rollbackFuncs;
                                    _a.label = 1;
                                case 1:
                                    if (!(_i < rollbackFuncs_2.length)) return [3 /*break*/, 4];
                                    rollbackFunc = rollbackFuncs_2[_i];
                                    return [4 /*yield*/, rollbackFunc()];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); };
                    return [2 /*return*/, [
                            productsBeingReserved,
                            availablePhysicalProducts,
                            rollbackProductVariantCounts,
                        ]];
            }
        });
    });
};
//# sourceMappingURL=updateProductVariantCounts.js.map