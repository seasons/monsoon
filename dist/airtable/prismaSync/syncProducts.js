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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var prisma_1 = require("../../prisma");
var slugify_1 = __importDefault(require("slugify"));
var lodash_1 = require("lodash");
var utils_2 = require("./utils");
exports.syncProducts = function (cliProgressBar) { return __awaiter(void 0, void 0, void 0, function () {
    var allBrands, allProducts, allCategories, allSizes, _a, multibar, _cliProgressBar, _loop_1, _i, allProducts_1, record;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, utils_1.getAllBrands()];
            case 1:
                allBrands = _d.sent();
                return [4 /*yield*/, utils_1.getAllProducts()];
            case 2:
                allProducts = _d.sent();
                return [4 /*yield*/, utils_1.getAllCategories()];
            case 3:
                allCategories = _d.sent();
                return [4 /*yield*/, utils_1.getAllSizes()];
            case 4:
                allSizes = _d.sent();
                return [4 /*yield*/, utils_2.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
                        cliProgressBar: cliProgressBar,
                        numRecords: allProducts.length,
                        modelName: "Products",
                    })];
            case 5:
                _a = _d.sent(), multibar = _a[0], _cliProgressBar = _a[1];
                _loop_1 = function (record) {
                    var model, name_1, brand, category, modelSize, color, description, images, modelHeight, externalURL, tags, retailPrice, innerMaterials, outerMaterials, status_1, type, slug, modelSizeRecord_1, _a, modelSizeDisplay, modelSizeType, modelSizeName, data, e_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 5, , 6]);
                                _cliProgressBar.increment();
                                model = record.model;
                                name_1 = model.name;
                                brand = allBrands.findByIds(model.brand);
                                category = allCategories.findByIds(model.category);
                                modelSize = allSizes.findByIds(model.modelSize);
                                if (lodash_1.isEmpty(model) ||
                                    lodash_1.isEmpty(name_1) ||
                                    lodash_1.isEmpty(brand) ||
                                    lodash_1.isEmpty(category)) {
                                    return [2 /*return*/, "continue"];
                                }
                                color = model.color, description = model.description, images = model.images, modelHeight = model.modelHeight, externalURL = model.externalURL, tags = model.tags, retailPrice = model.retailPrice, innerMaterials = model.innerMaterials, outerMaterials = model.outerMaterials, status_1 = model.status, type = model.type;
                                if (lodash_1.isEmpty(images)) {
                                    return [2 /*return*/, "continue"];
                                }
                                slug = slugify_1.default(name_1 + " " + color).toLowerCase();
                                if (!!!modelSize) return [3 /*break*/, 2];
                                _a = modelSize.model, modelSizeDisplay = _a.display, modelSizeType = _a.type, modelSizeName = _a.name;
                                return [4 /*yield*/, utils_2.deepUpsertSize({
                                        slug: slug,
                                        type: type,
                                        display: modelSizeDisplay,
                                        topSizeData: type === "Top" && {
                                            letter: modelSizeName,
                                        },
                                        bottomSizeData: type === "Bottom" && {
                                            type: modelSizeType,
                                            value: modelSizeName,
                                        },
                                    })];
                            case 1:
                                modelSizeRecord_1 = _b.sent();
                                _b.label = 2;
                            case 2:
                                data = __assign(__assign({ brand: {
                                        connect: {
                                            slug: brand.model.slug,
                                        },
                                    }, category: {
                                        connect: {
                                            slug: category.model.slug,
                                        },
                                    }, color: {
                                        connect: {
                                            slug: slugify_1.default(color).toLowerCase(),
                                        },
                                    }, innerMaterials: {
                                        set: (innerMaterials || []).map(function (a) { return a.replace(/\ /g, ""); }),
                                    }, outerMaterials: {
                                        set: (outerMaterials || []).map(function (a) { return a.replace(/\ /g, ""); }),
                                    }, tags: {
                                        set: tags,
                                    }, name: name_1,
                                    slug: slug,
                                    type: type,
                                    description: description,
                                    images: images,
                                    retailPrice: retailPrice,
                                    externalURL: externalURL }, (function () {
                                    return !!modelSizeRecord_1
                                        ? { modelSize: { connect: { id: modelSizeRecord_1.id } } }
                                        : {};
                                })()), { modelHeight: (_b = lodash_1.head(modelHeight), (_b !== null && _b !== void 0 ? _b : 0)), status: (status_1 || "Available").replace(" ", "") });
                                return [4 /*yield*/, prisma_1.prisma.upsertProduct({
                                        where: {
                                            slug: slug,
                                        },
                                        create: data,
                                        update: data,
                                    })];
                            case 3:
                                _b.sent();
                                return [4 /*yield*/, record.patchUpdate({
                                        Slug: slug,
                                    })];
                            case 4:
                                _b.sent();
                                return [3 /*break*/, 6];
                            case 5:
                                e_1 = _b.sent();
                                console.log(record);
                                console.error(e_1);
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, allProducts_1 = allProducts;
                _d.label = 6;
            case 6:
                if (!(_i < allProducts_1.length)) return [3 /*break*/, 9];
                record = allProducts_1[_i];
                return [5 /*yield**/, _loop_1(record)];
            case 7:
                _d.sent();
                _d.label = 8;
            case 8:
                _i++;
                return [3 /*break*/, 6];
            case 9:
                (_c = multibar) === null || _c === void 0 ? void 0 : _c.stop();
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=syncProducts.js.map