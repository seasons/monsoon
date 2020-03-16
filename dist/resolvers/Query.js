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
var Homepage_1 = require("./Homepage");
var Faq_1 = require("./Faq");
var utils_1 = require("../auth/utils");
var Payment_1 = require("./Payment");
var Search_1 = require("./Search");
var Products_1 = require("./Products");
exports.Query = __assign(__assign(__assign(__assign({}, Products_1.Products), { me: function (parent, args, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.getUserRequestObject(ctx)];
                    case 1:
                        id = (_a.sent()).id;
                        return [2 /*return*/, ctx.prisma.user({ id: id })];
                }
            });
        });
    }, brand: function (parent, args, ctx, info) { return ctx.db.query.brand(args, info); }, brands: function (parent, args, ctx, info) { return __awaiter(void 0, void 0, void 0, function () {
        var brands, brandsWithProducts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.db.query.brands(args, info)];
                case 1:
                    brands = _a.sent();
                    brandsWithProducts = brands.filter(function (brand) {
                        var _a, _b;
                        return ((_b = (_a = brand) === null || _a === void 0 ? void 0 : _a.products) === null || _b === void 0 ? void 0 : _b.length) > 0;
                    });
                    return [2 /*return*/, brandsWithProducts];
            }
        });
    }); }, product: function (parent, args, ctx, info) {
        return ctx.db.query.product(args, info);
    }, productRequests: function (parent, args, ctx, info) {
        return ctx.db.query.productRequests(args, info);
    }, collections: function (parent, args, ctx, info) {
        return ctx.db.query.collections(args, info);
    }, collection: function (parent, args, ctx, info) {
        return ctx.db.query.collection(args, info);
    }, productFunctions: function (parent, args, ctx, info) {
        return ctx.db.query.productFunctions(args, info);
    }, categories: function (parent, args, ctx, info) {
        return ctx.db.query.categories(args, info);
    }, homepageProductRails: function (parent, args, ctx, info) {
        return ctx.db.query.homepageProductRails(args, info);
    }, homepageProductRail: function (parent, args, ctx, info) {
        return ctx.db.query.homepageProductRail(args, info);
    }, homepage: Homepage_1.Homepage, faq: Faq_1.Faq }), Search_1.Search), Payment_1.Payment);
//# sourceMappingURL=Query.js.map