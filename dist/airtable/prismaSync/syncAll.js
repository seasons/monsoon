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
var _1 = require(".");
var utils_1 = require("../utils");
var utils_2 = require("./utils");
exports.syncAll = function () { return __awaiter(void 0, void 0, void 0, function () {
    var multibar, bars, _a, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                multibar = utils_1.makeAirtableSyncCliProgressBar();
                _a = {};
                return [4 /*yield*/, utils_2.createSubBar({ multibar: multibar, modelName: "Brands" })];
            case 1:
                _a.brands = _b.sent();
                return [4 /*yield*/, utils_2.createSubBar({
                        multibar: multibar,
                        modelName: "Categories",
                        numRecordsModifier: function (n) { return n * 2; },
                    })];
            case 2:
                _a.categories = _b.sent();
                return [4 /*yield*/, utils_2.createSubBar({ multibar: multibar, modelName: "Colors" })];
            case 3:
                _a.colors = _b.sent();
                return [4 /*yield*/, utils_2.createSubBar({ multibar: multibar, modelName: "Products" })];
            case 4:
                _a.products = _b.sent();
                return [4 /*yield*/, utils_2.createSubBar({
                        multibar: multibar,
                        modelName: "Product Variants",
                    })];
            case 5:
                _a.productVariants = _b.sent();
                return [4 /*yield*/, utils_2.createSubBar({
                        multibar: multibar,
                        modelName: "Physical Products",
                    })];
            case 6:
                _a.physicalProducts = _b.sent();
                return [4 /*yield*/, utils_2.createSubBar({ multibar: multibar, modelName: "Collections" })];
            case 7:
                _a.collections = _b.sent();
                return [4 /*yield*/, utils_2.createSubBar({
                        multibar: multibar,
                        modelName: "Collection Groups",
                    })];
            case 8:
                _a.collectionGroups = _b.sent();
                return [4 /*yield*/, utils_2.createSubBar({
                        multibar: multibar,
                        modelName: "Homepage Product Rails",
                    })];
            case 9:
                bars = (_a.homepageProductRails = _b.sent(),
                    _a);
                _b.label = 10;
            case 10:
                _b.trys.push([10, 20, 21, 22]);
                return [4 /*yield*/, _1.syncBrands(bars.brands)];
            case 11:
                _b.sent();
                return [4 /*yield*/, _1.syncCategories(bars.categories)];
            case 12:
                _b.sent();
                return [4 /*yield*/, _1.syncColors(bars.colors)];
            case 13:
                _b.sent();
                return [4 /*yield*/, _1.syncProducts(bars.products)];
            case 14:
                _b.sent();
                return [4 /*yield*/, _1.syncProductVariants(bars.productVariants)];
            case 15:
                _b.sent();
                return [4 /*yield*/, _1.syncPhysicalProducts(bars.physicalProducts)];
            case 16:
                _b.sent();
                return [4 /*yield*/, _1.syncCollections(bars.collections)];
            case 17:
                _b.sent();
                return [4 /*yield*/, _1.syncCollectionGroups(bars.collectionGroups)];
            case 18:
                _b.sent();
                return [4 /*yield*/, _1.syncHomepageProductRails(bars.homepageProductRails)];
            case 19:
                _b.sent();
                return [3 /*break*/, 22];
            case 20:
                e_1 = _b.sent();
                console.log(e_1);
                return [3 /*break*/, 22];
            case 21:
                multibar.stop();
                return [7 /*endfinally*/];
            case 22: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=syncAll.js.map