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
const utils_1 = require("../auth/utils");
exports.Me = {
    user: (parent, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = yield utils_1.getUserRequestObject(ctx);
        return ctx.prisma.user({ id });
    }),
    customer: (parent, args, ctx, info) => __awaiter(void 0, void 0, void 0, function* () {
        const customer = yield utils_1.getCustomerFromContext(ctx);
        return yield ctx.db.query.customer({
            where: { id: customer.id },
        }, info);
    }),
    activeReservation: (parent, args, ctx, info) => __awaiter(void 0, void 0, void 0, function* () {
        // FIXME: Remove reservationWithStatus after we add status to the info object in bag in harvest
        const customer = yield utils_1.getCustomerFromContext(ctx);
        const reservationWithStatus = yield ctx.prisma
            .customer({ id: customer.id })
            .reservations({
            orderBy: "createdAt_DESC",
        });
        const reservations = yield ctx.db.query.reservations({
            where: {
                customer: {
                    id: customer.id,
                },
            },
            orderBy: "createdAt_DESC",
        }, info);
        const latestReservationWithStatus = lodash_1.head(reservationWithStatus);
        const latestReservation = lodash_1.head(reservations);
        if (latestReservation &&
            latestReservationWithStatus &&
            !["Completed", "Cancelled"].includes(latestReservationWithStatus.status)) {
            return latestReservation;
        }
        return null;
    }),
    bag(parent, args, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield utils_1.getCustomerFromContext(ctx);
            const bagItems = yield ctx.db.query.bagItems({
                where: {
                    customer: {
                        id: customer.id,
                    },
                    saved: false,
                },
            }, info);
            return bagItems;
        });
    },
    savedItems(parent, args, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield utils_1.getCustomerFromContext(ctx);
            const savedItems = yield ctx.db.query.bagItems({
                where: {
                    customer: {
                        id: customer.id,
                    },
                    saved: true,
                },
            }, info);
            return savedItems;
        });
    },
};
//# sourceMappingURL=Me.js.map