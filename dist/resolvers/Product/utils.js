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
const apollo_server_1 = require("apollo-server");
const utils_1 = require("../../auth/utils");
function getPhysicalProductsWithReservationSpecificData(ctx, items) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield ctx.db.query.physicalProducts({
            where: {
                productVariant: {
                    id_in: items,
                },
            },
        }, `{ 
          id
          seasonsUID
          inventoryStatus 
          productVariant { 
              id 
          } 
      }`);
    });
}
exports.getPhysicalProductsWithReservationSpecificData = getPhysicalProductsWithReservationSpecificData;
function extractUniqueReservablePhysicalProducts(physicalProducts) {
    return lodash_1.uniqBy(physicalProducts.filter(a => a.inventoryStatus === "Reservable"), b => b.productVariant.id);
}
exports.extractUniqueReservablePhysicalProducts = extractUniqueReservablePhysicalProducts;
function checkLastReservation(lastReservation) {
    if (!!lastReservation &&
        ![
            "Completed",
            "Cancelled",
        ].includes(lastReservation.status)) {
        throw new apollo_server_1.ApolloError(`Last reservation has non-completed, non-cancelled status. Last Reservation number, status: ${lastReservation.reservationNumber}, ${lastReservation.status}`);
    }
}
exports.checkLastReservation = checkLastReservation;
/* Returns [createdReservation, rollbackFunc] */
function createPrismaReservation(prisma, reservationData) {
    return __awaiter(this, void 0, void 0, function* () {
        const reservation = yield prisma.createReservation(reservationData);
        const rollbackPrismaReservation = () => __awaiter(this, void 0, void 0, function* () {
            yield prisma.deleteReservation({ id: reservation.id });
        });
        return [reservation, rollbackPrismaReservation];
    });
}
exports.createPrismaReservation = createPrismaReservation;
function getReservedBagItems(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const customer = yield utils_1.getCustomerFromContext(ctx);
        const reservedBagItems = yield ctx.db.query.bagItems({
            where: {
                customer: {
                    id: customer.id,
                },
                status: "Reserved",
            },
        }, `{
        id
        status
        position
        saved
        productVariant {
          id
        }
    }`);
        return reservedBagItems;
    });
}
exports.getReservedBagItems = getReservedBagItems;
//# sourceMappingURL=utils.js.map