"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../prisma");
exports.Reservation = {
    products(parent) {
        return prisma_1.prisma
            .reservation({
            id: parent.id,
        })
            .products();
    },
};
//# sourceMappingURL=Reservation.js.map