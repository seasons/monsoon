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
var utils_1 = require("../utils");
var utils_2 = require("../../utils");
var config_1 = require("../config");
var getNumLinks_1 = require("./getNumLinks");
exports.airtableModelNameToGetAllFunc = function (modelname) {
    var func = {
        Colors: utils_1.getAllColors,
        Brands: utils_1.getAllBrands,
        Models: utils_1.getAllModels,
        Categories: utils_1.getAllCategories,
        Locations: utils_1.getAllLocations,
        Products: utils_1.getAllProducts,
        "Homepage Product Rails": utils_1.getAllHomepageProductRails,
        "Product Variants": utils_1.getAllProductVariants,
        "Physical Products": utils_1.getAllPhysicalProducts,
        Users: utils_1.getAllUsers,
        Reservations: utils_1.getAllReservations,
    }[modelname];
    if (!func) {
        throw new Error("Unrecognized model name: " + modelname);
    }
    return func;
};
exports.getNumProdAndStagingRecords = function (modelName) { return __awaiter(void 0, void 0, void 0, function () {
    var prodRecords, stagingRecords;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.airtableModelNameToGetAllFunc(modelName)(config_1.getProductionBase())];
            case 1:
                prodRecords = _a.sent();
                return [4 /*yield*/, exports.airtableModelNameToGetAllFunc(modelName)(config_1.getStagingBase())];
            case 2:
                stagingRecords = _a.sent();
                return [2 /*return*/, [prodRecords.length, stagingRecords.length]];
        }
    });
}); };
exports.getNumReadWritesToSyncModel = function (modelName) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, numProdRecs, numStagingRecs;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.getNumProdAndStagingRecords(modelName)];
            case 1:
                _a = _b.sent(), numProdRecs = _a[0], numStagingRecs = _a[1];
                return [2 /*return*/, (1 + getNumLinks_1.getNumLinks(modelName)) * numProdRecs + numStagingRecs];
        }
    });
}); };
exports.deleteAllStagingRecords = function (modelName, cliProgressBar) { return __awaiter(void 0, void 0, void 0, function () {
    var allRecords, _i, allRecords_1, rec;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.airtableModelNameToGetAllFunc(modelName)(config_1.getStagingBase())];
            case 1:
                allRecords = _b.sent();
                _i = 0, allRecords_1 = allRecords;
                _b.label = 2;
            case 2:
                if (!(_i < allRecords_1.length)) return [3 /*break*/, 5];
                rec = allRecords_1[_i];
                (_a = cliProgressBar) === null || _a === void 0 ? void 0 : _a.increment();
                return [4 /*yield*/, config_1.getStagingBase()("" + modelName).destroy([rec.id])];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.createAllStagingRecordsWithoutLinks = function (_a) {
    var modelName = _a.modelName, allProductionRecords = _a.allProductionRecords, sanitizeFunc = _a.sanitizeFunc, cliProgressBar = _a.cliProgressBar;
    return __awaiter(void 0, void 0, void 0, function () {
        var _i, allProductionRecords_1, rec;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _i = 0, allProductionRecords_1 = allProductionRecords;
                    _c.label = 1;
                case 1:
                    if (!(_i < allProductionRecords_1.length)) return [3 /*break*/, 4];
                    rec = allProductionRecords_1[_i];
                    (_b = cliProgressBar) === null || _b === void 0 ? void 0 : _b.increment();
                    // console.log(sanitizeFunc(rec.fields))
                    return [4 /*yield*/, config_1.getStagingBase()("" + modelName).create([
                            { fields: sanitizeFunc(rec.fields) },
                        ])];
                case 2:
                    // console.log(sanitizeFunc(rec.fields))
                    _c.sent();
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.sanitizeAttachments = function (attachments) { var _a; return (_a = attachments) === null || _a === void 0 ? void 0 : _a.map(function (a) { return utils_2.Identity({ url: a.url }); }); };
//# sourceMappingURL=utils.js.map