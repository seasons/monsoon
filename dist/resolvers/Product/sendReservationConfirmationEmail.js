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
const sendTransactionalEmail_1 = require("../../sendTransactionalEmail");
const emails_1 = require("../../emails");
const utils_1 = require("../../utils");
const formatReservationReturnDate_1 = require("./formatReservationReturnDate");
function sendReservationConfirmationEmail(prisma, user, products, reservation) {
    return __awaiter(this, void 0, void 0, function* () {
        const reservedItems = [
            yield getReservationConfirmationDataForProduct(prisma, products[0]),
        ];
        if (!!products[1]) {
            reservedItems.push(yield getReservationConfirmationDataForProduct(prisma, products[1]));
        }
        if (!!products[2]) {
            reservedItems.push(yield getReservationConfirmationDataForProduct(prisma, products[2]));
        }
        sendTransactionalEmail_1.sendTransactionalEmail({
            to: user.email,
            data: emails_1.emails.reservationConfirmationData(reservation.reservationNumber, reservedItems, formatReservationReturnDate_1.formatReservationReturnDate(new Date(reservation.createdAt))),
        });
    });
}
exports.sendReservationConfirmationEmail = sendReservationConfirmationEmail;
const getReservationConfirmationDataForProduct = (prisma, product) => __awaiter(void 0, void 0, void 0, function* () {
    return utils_1.Identity({
        url: product.images[0].url,
        brand: yield prisma
            .product({ id: product.id })
            .brand()
            .name(),
        name: product.name,
        price: product.retailPrice,
    });
});
//# sourceMappingURL=sendReservationConfirmationEmail.js.map