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
exports.ProductVariantWantMutations = {
    addProductVariantWant(parent, { variantID }, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield utils_1.getUserFromContext(ctx);
            if (!user) {
                throw new Error("Missing user from context");
            }
            const productVariant = yield ctx.prisma.productVariant({ id: variantID });
            if (!productVariant) {
                throw new Error("Unable to find product variant with matching ID");
            }
            const productVariantWant = yield ctx.prisma.createProductVariantWant({
                isFulfilled: false,
                productVariant: {
                    connect: {
                        id: productVariant.id,
                    },
                },
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            });
            return productVariantWant;
        });
    }
};
//# sourceMappingURL=ProductVariantWant.js.map