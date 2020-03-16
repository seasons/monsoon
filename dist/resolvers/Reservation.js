"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_1 = require("../prisma");
exports.Reservation = {
    products: function (parent) {
        return prisma_1.prisma
            .reservation({
            id: parent.id,
        })
            .products();
    },
};
//# sourceMappingURL=Reservation.js.map