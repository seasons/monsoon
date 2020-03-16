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
var slugify_1 = __importDefault(require("slugify"));
var prisma_1 = require("../../prisma");
var utils_1 = require("../utils");
var omit_1 = __importDefault(require("lodash/omit"));
var lodash_1 = require("lodash");
exports.syncLocations = function () { return __awaiter(void 0, void 0, void 0, function () {
    var allLocations, _i, allLocations_1, record, model, name_1, values, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, utils_1.getAllLocations()];
            case 1:
                allLocations = _a.sent();
                _i = 0, allLocations_1 = allLocations;
                _a.label = 2;
            case 2:
                if (!(_i < allLocations_1.length)) return [3 /*break*/, 8];
                record = allLocations_1[_i];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 6, , 7]);
                model = record.model;
                name_1 = model.name;
                if (lodash_1.isEmpty(model) || lodash_1.isEmpty(name_1)) {
                    return [3 /*break*/, 7];
                }
                values = omit_1.default(model, [
                    "physicalProducts",
                    "createdAt",
                    "updatedAt",
                    "recordID",
                    "reservations",
                    "reservations2",
                    "reservations3",
                    "users",
                    "users2",
                ]);
                values = __assign(__assign({}, values), { slug: slugify_1.default(values.name + Date.now() / 1000).toLowerCase() });
                return [4 /*yield*/, prisma_1.prisma.upsertLocation({
                        where: {
                            slug: values.slug,
                        },
                        create: values,
                        update: values,
                    })];
            case 4:
                _a.sent();
                return [4 /*yield*/, record.patchUpdate({
                        Slug: values.slug,
                    })];
            case 5:
                _a.sent();
                return [3 /*break*/, 7];
            case 6:
                e_1 = _a.sent();
                console.error(e_1);
                return [3 /*break*/, 7];
            case 7:
                _i++;
                return [3 /*break*/, 2];
            case 8: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=syncLocations.js.map