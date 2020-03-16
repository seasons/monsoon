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
const lodash_1 = require("lodash");
function getLatestReservation(prisma, db, customer) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                const allCustomerReservationsOrderedByCreatedAt = yield prisma
                    .customer({ id: customer.id })
                    .reservations({
                    orderBy: "createdAt_DESC",
                });
                const latestReservation = lodash_1.head(allCustomerReservationsOrderedByCreatedAt);
                if (latestReservation == null) {
                    resolve(null);
                }
                else {
                    const res = yield db.query.reservation({
                        where: { id: latestReservation.id },
                    }, `{ 
              id  
              products {
                  id
                  seasonsUID
                  inventoryStatus
                  productStatus
                  productVariant {
                      id
                  }
              }
              status
              reservationNumber
           }`);
                    resolve(res);
                }
            });
        });
    });
}
exports.getLatestReservation = getLatestReservation;
//# sourceMappingURL=getLatestReservation.js.map