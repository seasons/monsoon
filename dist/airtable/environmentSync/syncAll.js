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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
var cli_progress_1 = __importDefault(require("cli-progress"));
var utils_1 = require("./utils");
var checkTableAlignment_1 = require("./checkTableAlignment");
exports.syncAll = function () { return __awaiter(void 0, void 0, void 0, function () {
    var multibar, bars, _a, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                // Note that the order matters here in order to properly link between tables.
                console.log("\nNote: If you encounter errors, it's probably a field configuration issue on the destination base\n");
                console.log("Checking table alignments to surface would-be sync errors early...");
                return [4 /*yield*/, checkTableAlignment_1.checkAllTableAlignment()];
            case 1:
                _b.sent();
                multibar = new cli_progress_1.default.MultiBar({
                    clearOnComplete: false,
                    hideCursor: true,
                    format: "{modelName} {bar} {percentage}%  ETA: {eta}s  {value}/{total} ops",
                }, cli_progress_1.default.Presets.shades_grey);
                _a = {};
                return [4 /*yield*/, createSubBar(multibar, "Colors")];
            case 2:
                _a.colors = _b.sent();
                return [4 /*yield*/, createSubBar(multibar, "Brands")];
            case 3:
                _a.brands = _b.sent();
                return [4 /*yield*/, createSubBar(multibar, "Models")];
            case 4:
                _a.models = _b.sent();
                return [4 /*yield*/, createSubBar(multibar, "Categories")];
            case 5:
                _a.categories = _b.sent();
                return [4 /*yield*/, createSubBar(multibar, "Locations")];
            case 6:
                _a.locations = _b.sent();
                return [4 /*yield*/, createSubBar(multibar, "Products")];
            case 7:
                _a.products = _b.sent();
                return [4 /*yield*/, createSubBar(multibar, "Homepage Product Rails")];
            case 8:
                _a.homepageProductRails = _b.sent();
                return [4 /*yield*/, createSubBar(multibar, "Product Variants")];
            case 9:
                _a.productVariants = _b.sent();
                return [4 /*yield*/, createSubBar(multibar, "Physical Products")];
            case 10:
                _a.physicalProducts = _b.sent();
                return [4 /*yield*/, createSubBar(multibar, "Users")];
            case 11:
                _a.users = _b.sent();
                return [4 /*yield*/, createSubBar(multibar, "Reservations")];
            case 12:
                bars = (_a.reservations = _b.sent(),
                    _a);
                _b.label = 13;
            case 13:
                _b.trys.push([13, 25, 26, 27]);
                return [4 /*yield*/, _1.syncColors(bars.colors)];
            case 14:
                _b.sent();
                return [4 /*yield*/, _1.syncBrands(bars.brands)];
            case 15:
                _b.sent();
                return [4 /*yield*/, _1.syncModels(bars.models)];
            case 16:
                _b.sent();
                return [4 /*yield*/, _1.syncCategories(bars.categories)];
            case 17:
                _b.sent();
                return [4 /*yield*/, _1.syncLocations(bars.locations)];
            case 18:
                _b.sent();
                return [4 /*yield*/, _1.syncProducts(bars.products)];
            case 19:
                _b.sent();
                return [4 /*yield*/, _1.syncHomepageProductRails(bars.homepageProductRails)];
            case 20:
                _b.sent();
                return [4 /*yield*/, _1.syncProductVariants(bars.productVariants)];
            case 21:
                _b.sent();
                return [4 /*yield*/, _1.syncPhysicalProducts(bars.physicalProducts)];
            case 22:
                _b.sent();
                return [4 /*yield*/, _1.syncUsers(bars.users)];
            case 23:
                _b.sent();
                return [4 /*yield*/, _1.syncReservations(bars.reservations)];
            case 24:
                _b.sent();
                return [3 /*break*/, 27];
            case 25:
                err_1 = _b.sent();
                console.log(err_1);
                return [3 /*break*/, 27];
            case 26:
                multibar.stop();
                return [7 /*endfinally*/];
            case 27: return [2 /*return*/];
        }
    });
}); };
var createSubBar = function (multibar, modelName) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = multibar).create;
                return [4 /*yield*/, utils_1.getNumReadWritesToSyncModel(modelName)];
            case 1: return [2 /*return*/, _b.apply(_a, [_c.sent(), 0, {
                        modelName: (modelName + ":").padEnd("Homepage Product Rails".length + 1, " "),
                    }])];
        }
    });
}); };
//# sourceMappingURL=syncAll.js.map