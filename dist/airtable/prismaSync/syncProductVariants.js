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
var utils_1 = require("../utils");
var prisma_1 = require("../../prisma");
var utils_2 = require("../../utils");
var config_1 = require("../config");
var lodash_1 = require("lodash");
var utils_3 = require("./utils");
var SeasonsLocationID = "recvzTcW19kdBPqf4";
exports.syncProductVariants = function (cliProgressBar) { return __awaiter(void 0, void 0, void 0, function () {
    var allProductVariants, _a, multibar, _cliProgressBar, allBrands, allColors, allProducts, allLocations, allPhysicalProducts, allTopSizes, allBottomSizes, allSizes, _loop_1, _i, allProductVariants_1, productVariant;
    var _b, _c, _d, _e, _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0: return [4 /*yield*/, utils_1.getAllProductVariants()];
            case 1:
                allProductVariants = _j.sent();
                return [4 /*yield*/, utils_3.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
                        cliProgressBar: cliProgressBar,
                        numRecords: allProductVariants.length,
                        modelName: "Product Variants",
                    })
                    // Get all the relevant airtable records
                ];
            case 2:
                _a = _j.sent(), multibar = _a[0], _cliProgressBar = _a[1];
                return [4 /*yield*/, utils_1.getAllBrands()];
            case 3:
                allBrands = _j.sent();
                return [4 /*yield*/, utils_1.getAllColors()];
            case 4:
                allColors = _j.sent();
                return [4 /*yield*/, utils_1.getAllProducts()];
            case 5:
                allProducts = _j.sent();
                return [4 /*yield*/, utils_1.getAllLocations()];
            case 6:
                allLocations = _j.sent();
                return [4 /*yield*/, utils_1.getAllPhysicalProducts()];
            case 7:
                allPhysicalProducts = _j.sent();
                return [4 /*yield*/, utils_1.getAllTopSizes()];
            case 8:
                allTopSizes = _j.sent();
                return [4 /*yield*/, utils_1.getAllBottomSizes()];
            case 9:
                allBottomSizes = _j.sent();
                return [4 /*yield*/, utils_1.getAllSizes()];
            case 10:
                allSizes = _j.sent();
                _loop_1 = function (productVariant) {
                    var model, product_1, brand, color, location_1, styleNumber, topSize, bottomSize, type, sku, _a, totalCount, nonReservableCount, reservedCount, updatedReservableCount, weight, height, internalSizeRecord, linkedAirtableSize, manufacturerSizeRecords, existingManufacturerSizes, i, _i, _b, manufacturerSizeId, manufacturerSizeRecord, _c, display, type_1, value, _d, _e, data, physicalProducts, newPhysicalProducts, e_1;
                    return __generator(this, function (_f) {
                        switch (_f.label) {
                            case 0:
                                _f.trys.push([0, 12, , 13]);
                                // Increment the progress bar
                                _cliProgressBar.increment();
                                model = productVariant.model;
                                product_1 = allProducts.findByIds(model.product);
                                if (lodash_1.isEmpty(product_1)) {
                                    return [2 /*return*/, "continue"];
                                }
                                brand = allBrands.findByIds(product_1.model.brand);
                                color = allColors.find(function (x) { return x.model.name === product_1.model.color; });
                                location_1 = allLocations.find(function (x) { return x.id === SeasonsLocationID; });
                                styleNumber = product_1.model.styleCode;
                                topSize = allTopSizes.findByIds(model.topSize);
                                bottomSize = allBottomSizes.findByIds(model.bottomSize);
                                type = product_1.model.type;
                                if (lodash_1.isEmpty(model) ||
                                    lodash_1.isEmpty(brand) ||
                                    (lodash_1.isEmpty(topSize) && lodash_1.isEmpty(bottomSize)) ||
                                    (type === "Top" && lodash_1.isEmpty(topSize)) ||
                                    (type === "Bottom" && lodash_1.isEmpty(bottomSize))) {
                                    return [2 /*return*/, "continue"];
                                }
                                sku = skuForData(brand, color, sizeNameForProductVariant(type, topSize, bottomSize, allSizes), styleNumber);
                                _a = countsForVariant(productVariant), totalCount = _a.totalCount, nonReservableCount = _a.nonReservableCount, reservedCount = _a.reservedCount, updatedReservableCount = _a.updatedReservableCount;
                                weight = model.weight, height = model.height;
                                internalSizeRecord = void 0;
                                if (!(!!topSize || !!bottomSize)) return [3 /*break*/, 2];
                                linkedAirtableSize = void 0;
                                switch (type) {
                                    case "Top":
                                        linkedAirtableSize = allSizes.findByIds(topSize.model.size);
                                        break;
                                    case "Bottom":
                                        linkedAirtableSize = allSizes.findByIds(bottomSize.model.size);
                                        break;
                                }
                                return [4 /*yield*/, utils_3.deepUpsertSize({
                                        slug: sku + "-internal",
                                        type: type,
                                        display: ((_b = linkedAirtableSize) === null || _b === void 0 ? void 0 : _b.model.display) || "",
                                        topSizeData: type === "Top" &&
                                            !!topSize && {
                                            letter: ((_c = linkedAirtableSize) === null || _c === void 0 ? void 0 : _c.model.name) || null,
                                            sleeve: topSize.model.sleeve,
                                            shoulder: topSize.model.shoulder,
                                            chest: topSize.model.chest,
                                            neck: topSize.model.neck,
                                            length: topSize.model.length,
                                        },
                                        bottomSizeData: type === "Bottom" &&
                                            !!bottomSize && {
                                            type: ((_d = linkedAirtableSize) === null || _d === void 0 ? void 0 : _d.model.type) || null,
                                            value: ((_e = linkedAirtableSize) === null || _e === void 0 ? void 0 : _e.model.name) || "",
                                            waist: bottomSize.model.waist,
                                            rise: bottomSize.model.rise,
                                            hem: bottomSize.model.hem,
                                            inseam: bottomSize.model.inseam,
                                        },
                                    })];
                            case 1:
                                internalSizeRecord = _f.sent();
                                _f.label = 2;
                            case 2:
                                manufacturerSizeRecords = [];
                                if (!(type === "Bottom")) return [3 /*break*/, 8];
                                return [4 /*yield*/, prisma_1.prisma
                                        .productVariant({ sku: sku })
                                        .manufacturerSizes()];
                            case 3:
                                existingManufacturerSizes = _f.sent();
                                return [4 /*yield*/, prisma_1.prisma.deleteManySizes({
                                        id_in: ((_f = existingManufacturerSizes) === null || _f === void 0 ? void 0 : _f.map(function (a) { return a.id; })) || [],
                                    })
                                    // For each manufacturer size, store the name, type, and display value
                                ];
                            case 4:
                                _f.sent();
                                if (!!!((_g = bottomSize) === null || _g === void 0 ? void 0 : _g.model.manufacturerSizes)) return [3 /*break*/, 8];
                                i = 0;
                                _i = 0, _b = bottomSize.model.manufacturerSizes;
                                _f.label = 5;
                            case 5:
                                if (!(_i < _b.length)) return [3 /*break*/, 8];
                                manufacturerSizeId = _b[_i];
                                manufacturerSizeRecord = allSizes.findByIds(manufacturerSizeId);
                                _c = manufacturerSizeRecord.model, display = _c.display, type_1 = _c.type, value = _c.name;
                                _e = (_d = manufacturerSizeRecords).push;
                                return [4 /*yield*/, utils_3.deepUpsertSize({
                                        slug: sku + "-manu-" + type_1 + "-" + value,
                                        type: "Bottom",
                                        display: display,
                                        topSizeData: null,
                                        bottomSizeData: {
                                            type: type_1,
                                            value: value,
                                        },
                                    })];
                            case 6:
                                _e.apply(_d, [_f.sent()]);
                                _f.label = 7;
                            case 7:
                                _i++;
                                return [3 /*break*/, 5];
                            case 8:
                                data = {
                                    sku: sku,
                                    internalSize: {
                                        connect: {
                                            id: internalSizeRecord.id,
                                        },
                                    },
                                    manufacturerSizes: {
                                        connect: manufacturerSizeRecords.map(function (a) {
                                            return utils_2.Identity({
                                                id: a.id,
                                            });
                                        }),
                                    },
                                    weight: parseFloat(weight) || 0,
                                    height: parseFloat(height) || 0,
                                    total: totalCount,
                                    reservable: updatedReservableCount,
                                    reserved: reservedCount,
                                    nonReservable: nonReservableCount,
                                    color: {
                                        connect: {
                                            slug: color.model.slug,
                                        },
                                    },
                                    product: {
                                        connect: {
                                            slug: product_1.model.slug,
                                        },
                                    },
                                    productID: product_1.model.slug,
                                };
                                return [4 /*yield*/, prisma_1.prisma.upsertProductVariant({
                                        where: {
                                            sku: sku,
                                        },
                                        create: __assign({}, data),
                                        update: __assign({}, data),
                                    })
                                    // Figure out if we need to create new instance of physical products
                                    // based on the counts and what's available in the database
                                ];
                            case 9:
                                _f.sent();
                                physicalProducts = allPhysicalProducts.filter(function (a) {
                                    return (a.get("Product Variant") || []).includes(productVariant.id);
                                });
                                return [4 /*yield*/, createMorePhysicalProductsIfNeeded({
                                        sku: sku,
                                        location: location_1,
                                        product: product_1,
                                        productVariant: productVariant,
                                        physicalProducts: physicalProducts,
                                        totalCount: totalCount,
                                    })];
                            case 10:
                                newPhysicalProducts = _f.sent();
                                newPhysicalProducts.forEach(function (p) { return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, prisma_1.prisma.upsertPhysicalProduct({
                                                    where: {
                                                        seasonsUID: p.seasonsUID,
                                                    },
                                                    create: p,
                                                    update: p,
                                                })];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                                return [4 /*yield*/, productVariant.patchUpdate({
                                        SKU: sku,
                                        "Total Count": totalCount,
                                        "Reservable Count": updatedReservableCount,
                                        "Reserved Count": reservedCount,
                                        "Non-Reservable Count": nonReservableCount,
                                    })];
                            case 11:
                                _f.sent();
                                return [3 /*break*/, 13];
                            case 12:
                                e_1 = _f.sent();
                                console.log(productVariant);
                                console.error(e_1);
                                return [3 /*break*/, 13];
                            case 13: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, allProductVariants_1 = allProductVariants;
                _j.label = 11;
            case 11:
                if (!(_i < allProductVariants_1.length)) return [3 /*break*/, 14];
                productVariant = allProductVariants_1[_i];
                return [5 /*yield**/, _loop_1(productVariant)];
            case 12:
                _j.sent();
                _j.label = 13;
            case 13:
                _i++;
                return [3 /*break*/, 11];
            case 14:
                (_h = multibar) === null || _h === void 0 ? void 0 : _h.stop();
                return [2 /*return*/];
        }
    });
}); };
var skuForData = function (brand, color, sizeName, styleNumber) {
    var brandCode = brand.get("Brand Code");
    var colorCode = color.get("Color Code");
    var sizeCode = utils_2.sizeNameToSizeCode(sizeName);
    var styleCode = styleNumber.toString().padStart(3, "0");
    return brandCode + "-" + colorCode + "-" + sizeCode + "-" + styleCode;
};
var sizeNameForProductVariant = function (type, topSize, bottomSize, allSizes) {
    var _a, _b;
    switch (type) {
        case "Top":
            return (_a = allSizes.findByIds(topSize.model.size)) === null || _a === void 0 ? void 0 : _a.model.name;
        case "Bottom":
            return (_b = allSizes.findByIds(bottomSize.model.size)) === null || _b === void 0 ? void 0 : _b.model.name;
        default:
            throw new Error("Invalid product type: " + type);
    }
};
var countsForVariant = function (productVariant) {
    var data = {
        totalCount: productVariant.get("Total Count") || 0,
        reservedCount: productVariant.get("Reserved Count") || 0,
        nonReservableCount: productVariant.get("Non-Reservable Count") || 0,
    };
    // Assume all newly added product variants are reservable, and calculate the
    // number of such product variants as the remainder once reserved and nonReservable
    // are taken into account
    var updatedData = __assign(__assign({}, data), { updatedReservableCount: data.totalCount - data.reservedCount - data.nonReservableCount });
    // Make sure these counts make sense
    if (updatedData.totalCount < 0 ||
        updatedData.updatedReservableCount < 0 ||
        updatedData.nonReservableCount < 0 ||
        updatedData.totalCount < 0 ||
        updatedData.totalCount !==
            updatedData.reservedCount +
                updatedData.nonReservableCount +
                updatedData.updatedReservableCount) {
        throw new Error("Invalid counts: " + updatedData);
    }
    return updatedData;
};
var createMorePhysicalProductsIfNeeded = function (_a) {
    var sku = _a.sku, productVariant = _a.productVariant, product = _a.product, physicalProducts = _a.physicalProducts, totalCount = _a.totalCount;
    return __awaiter(void 0, void 0, void 0, function () {
        var physicalProductCount, newPhysicalProducts, i, physicalProductID;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    physicalProductCount = physicalProducts.length;
                    newPhysicalProducts = [];
                    if (!(physicalProductCount < totalCount)) return [3 /*break*/, 2];
                    for (i = 1; i <= totalCount - physicalProductCount; i++) {
                        physicalProductID = (physicalProductCount + i)
                            .toString()
                            .padStart(2, "0");
                        newPhysicalProducts.push({
                            fields: {
                                SUID: {
                                    text: sku + ("-" + physicalProductID),
                                },
                                Product: [product.id],
                                "Product Variant": [productVariant.id],
                                "Inventory Status": "Non Reservable",
                                "Product Status": "New",
                            },
                        });
                    }
                    return [4 /*yield*/, config_1.base("Physical Products").create(newPhysicalProducts)];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2: return [2 /*return*/, newPhysicalProducts.map(function (_a) {
                        var fields = _a.fields;
                        return ({
                            seasonsUID: fields.SUID.text,
                            productVariant: {
                                connect: {
                                    sku: sku,
                                },
                            },
                            inventoryStatus: "Reservable",
                            productStatus: fields["Product Status"],
                        });
                    })];
            }
        });
    });
};
//# sourceMappingURL=syncProductVariants.js.map