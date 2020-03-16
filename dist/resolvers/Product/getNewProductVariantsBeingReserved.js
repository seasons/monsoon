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
function getNewProductVariantsBeingReserved(lastReservation, items) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                if (lastReservation == null) {
                    resolve(items);
                    return;
                }
                const productVariantsInLastReservation = lastReservation.products.map(prod => prod.productVariant.id);
                const newProductVariantBeingReserved = items.filter(prodVarId => {
                    const notInLastReservation = !productVariantsInLastReservation.includes(prodVarId);
                    const inLastReservationButNowReservable = productVariantsInLastReservation.includes(prodVarId) &&
                        inventoryStatusOf(lastReservation, prodVarId) === "Reservable";
                    return notInLastReservation || inLastReservationButNowReservable;
                });
                resolve(newProductVariantBeingReserved);
            });
        });
    });
}
exports.getNewProductVariantsBeingReserved = getNewProductVariantsBeingReserved;
function inventoryStatusOf(res, prodVarId) {
    return res.products.find(prod => prod.productVariant.id === prodVarId)
        .inventoryStatus;
}
//# sourceMappingURL=getNewProductVariantsBeingReserved.js.map