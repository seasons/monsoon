"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatReservationReturnDate = function (reservationCreatedAtDate) {
    var returnDate = new Date(reservationCreatedAtDate);
    returnDate.setDate(reservationCreatedAtDate.getDate() + 30);
    return returnDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};
//# sourceMappingURL=formatReservationReturnDate.js.map