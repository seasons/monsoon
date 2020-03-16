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
const utils_1 = require("../auth/utils");
exports.ProductVariant = {
    isSaved(parent, {}, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const customer = yield utils_1.getCustomerFromContext(ctx);
                const bagItems = yield ctx.prisma.bagItems({
                    where: {
                        productVariant: {
                            id: parent.id,
                        },
                        customer: {
                            id: customer.id,
                        },
                        saved: true,
                    },
                });
                return bagItems.length > 0;
            }
            catch (e) {
                // In case no customer is set
            }
            return false;
        });
    },
    isWanted(parent, {}, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = null;
            try {
                user = yield utils_1.getUserFromContext(ctx);
            }
            catch (e) {
                return false;
            }
            if (!user) {
                return false;
            }
            const productVariant = yield ctx.prisma.productVariant({ id: parent.id });
            if (!productVariant) {
                return false;
            }
            const productVariantWants = yield ctx.prisma.productVariantWants({
                where: {
                    user: {
                        id: user.id,
                    },
                    AND: {
                        productVariant: {
                            id: productVariant.id,
                        },
                    },
                },
            });
            const exists = productVariantWants && productVariantWants.length > 0;
            return exists;
        });
    },
};
//# sourceMappingURL=ProductVariant.js.map