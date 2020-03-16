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
var prisma_1 = require("../../prisma");
var lodash_1 = require("lodash");
var utils_2 = require("./utils");
exports.syncPhysicalProducts = function (cliProgressBar) { return __awaiter(void 0, void 0, void 0, function () {
    var allProductVariants, allPhysicalProducts, _a, multibar, _cliProgressBar, _i, allPhysicalProducts_1, record, model, productVariant, sUID, inventoryStatus, productStatus, data, e_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, utils_1.getAllProductVariants()];
            case 1:
                allProductVariants = _c.sent();
                return [4 /*yield*/, utils_1.getAllPhysicalProducts()];
            case 2:
                allPhysicalProducts = _c.sent();
                return [4 /*yield*/, utils_2.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
                        cliProgressBar: cliProgressBar,
                        numRecords: allPhysicalProducts.length,
                        modelName: "Physical Products",
                    })];
            case 3:
                _a = _c.sent(), multibar = _a[0], _cliProgressBar = _a[1];
                _i = 0, allPhysicalProducts_1 = allPhysicalProducts;
                _c.label = 4;
            case 4:
                if (!(_i < allPhysicalProducts_1.length)) return [3 /*break*/, 9];
                record = allPhysicalProducts_1[_i];
                _cliProgressBar.increment();
                _c.label = 5;
            case 5:
                _c.trys.push([5, 7, , 8]);
                model = record.model;
                productVariant = allProductVariants.findByIds(model.productVariant);
                if (lodash_1.isEmpty(model)) {
                    return [3 /*break*/, 8];
                }
                sUID = model.sUID, inventoryStatus = model.inventoryStatus, productStatus = model.productStatus;
                if (sUID.text.startsWith("HEVO-RED")) {
                    return [3 /*break*/, 8];
                }
                data = {
                    productVariant: {
                        connect: {
                            sku: productVariant.model.sKU,
                        },
                    },
                    seasonsUID: sUID.text,
                    inventoryStatus: inventoryStatus.replace(" ", ""),
                    productStatus: productStatus,
                };
                return [4 /*yield*/, prisma_1.prisma.upsertPhysicalProduct({
                        where: {
                            seasonsUID: sUID.text,
                        },
                        create: data,
                        update: data,
                    })];
            case 6:
                _c.sent();
                return [3 /*break*/, 8];
            case 7:
                e_1 = _c.sent();
                console.error(e_1);
                return [3 /*break*/, 8];
            case 8:
                _i++;
                return [3 /*break*/, 4];
            case 9:
                (_b = multibar) === null || _b === void 0 ? void 0 : _b.stop();
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=syncPhysicalProducts.js.map