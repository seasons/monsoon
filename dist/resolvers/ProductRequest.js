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
const cheerio = __importStar(require("cheerio"));
const request_1 = __importDefault(require("request"));
const utils_1 = require("../auth/utils");
exports.ProductRequestMutations = {
    addProductRequest(parent, { reason, url }, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                // Set jar: true to avoid possible redirect loop
                request_1.default({ jar: true, url }, (error, response, body) => __awaiter(this, void 0, void 0, function* () {
                    // Handle a generic error
                    if (error) {
                        reject(error);
                        return;
                    }
                    const user = yield utils_1.getUserFromContext(ctx);
                    if (!user) {
                        reject("Missing user from context");
                    }
                    const $ = cheerio.load(body, { xmlMode: false });
                    // First try looking for ld+json
                    let productRequest = yield scrapeLDJSON($, reason, url, user, ctx);
                    if (productRequest) {
                        resolve(productRequest);
                        return;
                    }
                    // Then try looking for og (open graph) meta tags
                    productRequest = yield scrapeOGTags($, reason, url, user, ctx);
                    if (productRequest) {
                        resolve(productRequest);
                        return;
                    }
                    // Otherwise, means we failed to scrape URL so just store 
                    // the reason and URL itself
                    productRequest = yield ctx.prisma.createProductRequest({
                        reason,
                        url,
                        user: {
                            connect: {
                                id: user.id,
                            },
                        },
                    });
                    resolve(productRequest);
                }));
            });
        });
    },
    deleteProductRequest(parent, { requestID }, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const productRequest = yield ctx.prisma.deleteProductRequest({
                        id: requestID,
                    });
                    resolve(productRequest);
                }
                catch (e) {
                    reject(e);
                }
            }));
        });
    },
};
const scrapeLDJSON = ($, reason, url, user, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // Search for json+ld in HTML body
    const ldJSONHTML = $("script[type='application/ld+json']").html();
    const ldJSON = JSON.parse(ldJSONHTML);
    if (!ldJSON) {
        // Failed to extract json+ld from URL
        return null;
    }
    // Extract fields from json+ld
    const { description, name, sku } = ldJSON;
    const brand = ldJSON.brand ? ldJSON.brand.name : null;
    const images = ldJSON.image ? ldJSON.image : null;
    const price = ldJSON.offers ? ldJSON.offers.price : null;
    const priceCurrency = ldJSON.offers ? ldJSON.offers.priceCurrency : null;
    const productID = ldJSON.productID ? ldJSON.productID.toString() : null;
    if (description &&
        name &&
        productID &&
        sku &&
        brand &&
        images &&
        price &&
        priceCurrency) {
        return yield createProductRequest(ctx, user, brand, description, images, name, price, priceCurrency, productID, reason, sku, url);
    }
    else {
        // Incorrectly formatted json+ld
        return null;
    }
});
const scrapeOGTags = ($, reason, url, user, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const ogDescription = $('meta[property="og:description"]').attr("content");
    const ogPriceAmount = parseInt($('meta[property="og:price:amount"]').attr("content"));
    const ogPriceCurrency = $('meta[property="og:price:currency"]').attr("content");
    const ogSKU = $('meta[property="product:retailer_item_id"]').attr("content");
    const ogSiteName = $('meta[property="og:site_name"]').attr("content");
    const ogTitle = $('meta[property="og:title"]').attr("content");
    const productID = $('meta[itemprop="productID"]').attr("content");
    let ogImages = [];
    $('meta[property="og:image"]').each((index, elem) => {
        ogImages.push($(elem).attr("content"));
    });
    if (ogDescription &&
        ogPriceAmount &&
        ogPriceCurrency &&
        ogSKU &&
        ogSiteName &&
        ogTitle &&
        productID &&
        ogImages) {
        return yield createProductRequest(ctx, user, ogSiteName, ogDescription, ogImages, ogTitle, ogPriceAmount, ogPriceCurrency, productID, reason, ogSKU, url);
    }
    else {
        return null;
    }
});
const createProductRequest = (ctx, user, brand, description, images, name, price, priceCurrency, productID, reason, sku, url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productRequest = yield ctx.prisma.createProductRequest({
            brand,
            description,
            images: { set: images },
            name,
            price,
            priceCurrency,
            productID,
            reason,
            sku,
            url,
            user: {
                connect: {
                    id: user.id,
                },
            },
        });
        return productRequest;
    }
    catch (e) {
        return null;
    }
});
//# sourceMappingURL=ProductRequest.js.map