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
var utils_1 = require("../../utils");
var utils_2 = require("../utils");
var config_1 = require("../config");
var _1 = require(".");
exports.syncPhysicalProducts = function (cliProgressBar) { return __awaiter(void 0, void 0, void 0, function () {
    var allPhysicalProductsProduction, allPhysicalProductsStaging;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, utils_2.getAllPhysicalProducts(config_1.getProductionBase())];
            case 1:
                allPhysicalProductsProduction = _a.sent();
                return [4 /*yield*/, _1.deleteAllStagingRecords("Physical Products", cliProgressBar)];
            case 2:
                _a.sent();
                return [4 /*yield*/, _1.createAllStagingRecordsWithoutLinks({
                        modelName: "Physical Products",
                        allProductionRecords: allPhysicalProductsProduction,
                        sanitizeFunc: function (fields) {
                            return utils_1.deleteFieldsFromObject(__assign(__assign({}, fields), { Product: [], Location: [], "Product Variant": [], Reservations: [] }), [
                                "Created At",
                                "Updated At",
                                "Sequence Number",
                                "Item Weight",
                                "Barcode Image URL",
                                "Images",
                                "Barcode",
                                "Category",
                            ]);
                        },
                        cliProgressBar: cliProgressBar,
                    })];
            case 3:
                _a.sent();
                return [4 /*yield*/, utils_2.getAllPhysicalProducts(config_1.getStagingBase())];
            case 4:
                allPhysicalProductsStaging = _a.sent();
                return [4 /*yield*/, addProductLinks(allPhysicalProductsProduction, allPhysicalProductsStaging, cliProgressBar)];
            case 5:
                _a.sent();
                return [4 /*yield*/, addProductVariantLinks(allPhysicalProductsProduction, allPhysicalProductsStaging, cliProgressBar)];
            case 6:
                _a.sent();
                return [4 /*yield*/, addLocationLinks(allPhysicalProductsProduction, allPhysicalProductsStaging, cliProgressBar)];
            case 7:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.getNumLinksPhysicalProducts = function () { return 3; };
var addProductLinks = function (allPhysicalProductsProduction, allPhysicalProductsStaging, cliProgressBar) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = _1.linkStagingRecords;
                _b = {
                    rootRecordName: "Physical Products",
                    targetFieldNameOnRootRecord: "Product",
                    allRootProductionRecords: allPhysicalProductsProduction,
                    allRootStagingRecords: allPhysicalProductsStaging
                };
                return [4 /*yield*/, utils_2.getAllProducts(config_1.getProductionBase())];
            case 1:
                _b.allTargetProductionRecords = _c.sent();
                return [4 /*yield*/, utils_2.getAllProducts(config_1.getStagingBase())];
            case 2: return [4 /*yield*/, _a.apply(void 0, [(_b.allTargetStagingRecords = _c.sent(),
                        _b.getRootRecordIdentifer = function (rec) { return rec.fields.SUID.text; },
                        _b.getTargetRecordIdentifer = function (rec) { return rec.fields.Slug; },
                        _b.cliProgressBar = cliProgressBar,
                        _b)])];
            case 3:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
var addProductVariantLinks = function (allPhysicalProductsProduction, allPhysicalProductsStaging, cliProgressBar) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = _1.linkStagingRecords;
                _b = {
                    rootRecordName: "Physical Products",
                    targetFieldNameOnRootRecord: "Product Variant",
                    allRootProductionRecords: allPhysicalProductsProduction,
                    allRootStagingRecords: allPhysicalProductsStaging
                };
                return [4 /*yield*/, utils_2.getAllProductVariants(config_1.getProductionBase())];
            case 1:
                _b.allTargetProductionRecords = _c.sent();
                return [4 /*yield*/, utils_2.getAllProductVariants(config_1.getStagingBase())];
            case 2: return [4 /*yield*/, _a.apply(void 0, [(_b.allTargetStagingRecords = _c.sent(),
                        _b.getRootRecordIdentifer = function (rec) { return rec.fields.SUID.text; },
                        _b.getTargetRecordIdentifer = function (rec) { return rec.fields.SKU; },
                        _b.cliProgressBar = cliProgressBar,
                        _b)])];
            case 3:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
var addLocationLinks = function (allPhysicalProductsProduction, allPhysicalProductsStaging, cliProgressBar) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = _1.linkStagingRecords;
                _b = {
                    rootRecordName: "Physical Products",
                    targetFieldNameOnRootRecord: "Location",
                    allRootProductionRecords: allPhysicalProductsProduction,
                    allRootStagingRecords: allPhysicalProductsStaging
                };
                return [4 /*yield*/, utils_2.getAllLocations(config_1.getProductionBase())];
            case 1:
                _b.allTargetProductionRecords = _c.sent();
                return [4 /*yield*/, utils_2.getAllLocations(config_1.getStagingBase())];
            case 2: return [4 /*yield*/, _a.apply(void 0, [(_b.allTargetStagingRecords = _c.sent(),
                        _b.getRootRecordIdentifer = function (rec) { return rec.fields.SUID.text; },
                        _b.getTargetRecordIdentifer = function (rec) { return rec.fields.Slug; },
                        _b.cliProgressBar = cliProgressBar,
                        _b)])];
            case 3:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=syncPhysicalProducts.js.map