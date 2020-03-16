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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio = __importStar(require("cheerio"));
var request_1 = __importDefault(require("request"));
var utils_1 = require("../auth/utils");
exports.ProductRequestMutations = {
    addProductRequest: function (parent, _a, ctx, info) {
        var reason = _a.reason, url = _a.url;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        // Set jar: true to avoid possible redirect loop
                        request_1.default({ jar: true, url: url }, function (error, response, body) { return __awaiter(_this, void 0, void 0, function () {
                            var user, $, productRequest;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        // Handle a generic error
                                        if (error) {
                                            reject(error);
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, utils_1.getUserFromContext(ctx)];
                                    case 1:
                                        user = _a.sent();
                                        if (!user) {
                                            reject("Missing user from context");
                                        }
                                        $ = cheerio.load(body, { xmlMode: false });
                                        return [4 /*yield*/, scrapeLDJSON($, reason, url, user, ctx)];
                                    case 2:
                                        productRequest = _a.sent();
                                        if (productRequest) {
                                            resolve(productRequest);
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, scrapeOGTags($, reason, url, user, ctx)];
                                    case 3:
                                        // Then try looking for og (open graph) meta tags
                                        productRequest = _a.sent();
                                        if (productRequest) {
                                            resolve(productRequest);
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, ctx.prisma.createProductRequest({
                                                reason: reason,
                                                url: url,
                                                user: {
                                                    connect: {
                                                        id: user.id,
                                                    },
                                                },
                                            })];
                                    case 4:
                                        // Otherwise, means we failed to scrape URL so just store 
                                        // the reason and URL itself
                                        productRequest = _a.sent();
                                        resolve(productRequest);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    })];
            });
        });
    },
    deleteProductRequest: function (parent, _a, ctx, info) {
        var requestID = _a.requestID;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var productRequest, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, ctx.prisma.deleteProductRequest({
                                            id: requestID,
                                        })];
                                case 1:
                                    productRequest = _a.sent();
                                    resolve(productRequest);
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_1 = _a.sent();
                                    reject(e_1);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    },
};
var scrapeLDJSON = function ($, reason, url, user, ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var ldJSONHTML, ldJSON, description, name, sku, brand, images, price, priceCurrency, productID;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ldJSONHTML = $("script[type='application/ld+json']").html();
                ldJSON = JSON.parse(ldJSONHTML);
                if (!ldJSON) {
                    // Failed to extract json+ld from URL
                    return [2 /*return*/, null];
                }
                description = ldJSON.description, name = ldJSON.name, sku = ldJSON.sku;
                brand = ldJSON.brand ? ldJSON.brand.name : null;
                images = ldJSON.image ? ldJSON.image : null;
                price = ldJSON.offers ? ldJSON.offers.price : null;
                priceCurrency = ldJSON.offers ? ldJSON.offers.priceCurrency : null;
                productID = ldJSON.productID ? ldJSON.productID.toString() : null;
                if (!(description &&
                    name &&
                    productID &&
                    sku &&
                    brand &&
                    images &&
                    price &&
                    priceCurrency)) return [3 /*break*/, 2];
                return [4 /*yield*/, createProductRequest(ctx, user, brand, description, images, name, price, priceCurrency, productID, reason, sku, url)];
            case 1: return [2 /*return*/, _a.sent()];
            case 2: 
            // Incorrectly formatted json+ld
            return [2 /*return*/, null];
        }
    });
}); };
var scrapeOGTags = function ($, reason, url, user, ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var ogDescription, ogPriceAmount, ogPriceCurrency, ogSKU, ogSiteName, ogTitle, productID, ogImages;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ogDescription = $('meta[property="og:description"]').attr("content");
                ogPriceAmount = parseInt($('meta[property="og:price:amount"]').attr("content"));
                ogPriceCurrency = $('meta[property="og:price:currency"]').attr("content");
                ogSKU = $('meta[property="product:retailer_item_id"]').attr("content");
                ogSiteName = $('meta[property="og:site_name"]').attr("content");
                ogTitle = $('meta[property="og:title"]').attr("content");
                productID = $('meta[itemprop="productID"]').attr("content");
                ogImages = [];
                $('meta[property="og:image"]').each(function (index, elem) {
                    ogImages.push($(elem).attr("content"));
                });
                if (!(ogDescription &&
                    ogPriceAmount &&
                    ogPriceCurrency &&
                    ogSKU &&
                    ogSiteName &&
                    ogTitle &&
                    productID &&
                    ogImages)) return [3 /*break*/, 2];
                return [4 /*yield*/, createProductRequest(ctx, user, ogSiteName, ogDescription, ogImages, ogTitle, ogPriceAmount, ogPriceCurrency, productID, reason, ogSKU, url)];
            case 1: return [2 /*return*/, _a.sent()];
            case 2: return [2 /*return*/, null];
        }
    });
}); };
var createProductRequest = function (ctx, user, brand, description, images, name, price, priceCurrency, productID, reason, sku, url) { return __awaiter(void 0, void 0, void 0, function () {
    var productRequest, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, ctx.prisma.createProductRequest({
                        brand: brand,
                        description: description,
                        images: { set: images },
                        name: name,
                        price: price,
                        priceCurrency: priceCurrency,
                        productID: productID,
                        reason: reason,
                        sku: sku,
                        url: url,
                        user: {
                            connect: {
                                id: user.id,
                            },
                        },
                    })];
            case 1:
                productRequest = _a.sent();
                return [2 /*return*/, productRequest];
            case 2:
                e_2 = _a.sent();
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=ProductRequest.js.map