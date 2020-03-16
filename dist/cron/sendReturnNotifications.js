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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../prisma");
const luxon_1 = require("luxon");
const sendTransactionalEmail_1 = require("../sendTransactionalEmail");
const emails_1 = require("../emails");
const formatReservationReturnDate_1 = require("../resolvers/Product/formatReservationReturnDate");
const Sentry = __importStar(require("@sentry/node"));
const shouldReportErrorsToSentry = process.env.NODE_ENV === "production";
if (shouldReportErrorsToSentry) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
    });
}
exports.sendReturnNotifications = () => __awaiter(void 0, void 0, void 0, function* () {
    const reservations = yield prisma_1.prisma.reservations({
        orderBy: "createdAt_DESC",
    });
    const report = {
        reservationsForWhichRemindersWereSent: [],
        errors: [],
    };
    for (const reservation of reservations) {
        try {
            if (shouldReportErrorsToSentry) {
                Sentry.configureScope(scope => {
                    scope.setExtra("reservationNumber", reservation.reservationNumber);
                    scope.setExtra("reservation createdAt", reservation.createdAt);
                    scope.setExtra("reservation status", reservation.status);
                });
            }
            if (yield returnNoticeNeeded(reservation)) {
                //   Remind customer to return items
                const user = yield prisma_1.prisma
                    .reservation({
                    id: reservation.id,
                })
                    .customer()
                    .user();
                sendTransactionalEmail_1.sendTransactionalEmail({
                    to: user.email,
                    data: emails_1.emails.returnReminderData({
                        name: user.firstName,
                        returnDate: formatReservationReturnDate_1.formatReservationReturnDate(new Date(reservation.createdAt)),
                    }),
                });
                yield prisma_1.prisma.updateReservation({
                    where: { id: reservation.id },
                    data: { reminderSentAt: luxon_1.DateTime.local().toString() },
                });
                report.reservationsForWhichRemindersWereSent.push(reservation.reservationNumber);
            }
        }
        catch (err) {
            report.errors.push(err);
            if (shouldReportErrorsToSentry) {
                Sentry.captureException(err);
            }
        }
    }
    console.log(report);
    return report;
});
const returnNoticeNeeded = (reservation) => __awaiter(void 0, void 0, void 0, function* () {
    const now = luxon_1.DateTime.local();
    const reservationCreatedAt = luxon_1.DateTime.fromISO(reservation.createdAt);
    const twentyEightToTwentyNineDaysAgo = luxon_1.Interval.fromDateTimes(now.minus({ days: 29 }), now.minus({ days: 28 }));
    const customer = yield prisma_1.prisma
        .reservation({
        id: reservation.id,
    })
        .customer();
    return (twentyEightToTwentyNineDaysAgo.contains(reservationCreatedAt) &&
        !reservation.reminderSentAt &&
        customer.plan === "Essential" &&
        !["Cancelled", "Completed"].includes(reservation.status));
});
//# sourceMappingURL=sendReturnNotifications.js.map