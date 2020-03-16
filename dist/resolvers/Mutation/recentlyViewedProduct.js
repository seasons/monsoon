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
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../auth/utils");
const lodash_1 = require("lodash");
exports.recentlyViewedProduct = {
    addViewedProduct(_obj, { item }, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield utils_1.getCustomerFromContext(ctx);
            const viewedProducts = yield ctx.db.query.recentlyViewedProducts({
                where: {
                    customer: { id: customer.id },
                    product: { id: item },
                },
            }, info);
            const viewedProduct = lodash_1.head(viewedProducts);
            if (viewedProduct) {
                return yield ctx.prisma.updateRecentlyViewedProduct({
                    where: {
                        id: viewedProduct.id,
                    },
                    data: {
                        viewCount: viewedProduct.viewCount++,
                    },
                });
            }
            else {
                return yield ctx.prisma.createRecentlyViewedProduct({
                    customer: {
                        connect: {
                            id: customer.id,
                        },
                    },
                    product: {
                        connect: {
                            id: item,
                        },
                    },
                    viewCount: 1,
                });
            }
        });
    },
};
//# sourceMappingURL=recentlyViewedProduct.js.map