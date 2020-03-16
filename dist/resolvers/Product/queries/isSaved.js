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
const utils_1 = require("../../../auth/utils");
function isSaved(parent, {}, ctx, info) {
    return __awaiter(this, void 0, void 0, function* () {
        let customer;
        try {
            customer = yield utils_1.getCustomerFromContext(ctx);
        }
        catch (error) {
            return false;
        }
        const productVariants = yield ctx.prisma.productVariants({
            where: {
                product: {
                    id: parent.id,
                },
            },
        });
        const bagItem = yield ctx.prisma.bagItems({
            where: {
                customer: {
                    id: customer.id,
                },
                productVariant: {
                    id_in: productVariants.map(a => a.id),
                },
                saved: true,
            },
        });
        return bagItem.length > 0;
    });
}
exports.isSaved = isSaved;
//# sourceMappingURL=isSaved.js.map