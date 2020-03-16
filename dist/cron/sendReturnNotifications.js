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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_1 = require("../prisma");
var luxon_1 = require("luxon");
var sendTransactionalEmail_1 = require("../sendTransactionalEmail");
var emails_1 = require("../emails");
var formatReservationReturnDate_1 = require("../resolvers/Product/formatReservationReturnDate");
var Sentry = __importStar(require("@sentry/node"));
var shouldReportErrorsToSentry = process.env.NODE_ENV === "production";
if (shouldReportErrorsToSentry) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
    });
}
exports.sendReturnNotifications = function () { return __awaiter(void 0, void 0, void 0, function () {
    var reservations, report, _loop_1, _i, reservations_1, reservation;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.prisma.reservations({
                    orderBy: "createdAt_DESC",
                })];
            case 1:
                reservations = _a.sent();
                report = {
                    reservationsForWhichRemindersWereSent: [],
                    errors: [],
                };
                _loop_1 = function (reservation) {
                    var user, err_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 5, , 6]);
                                if (shouldReportErrorsToSentry) {
                                    Sentry.configureScope(function (scope) {
                                        scope.setExtra("reservationNumber", reservation.reservationNumber);
                                        scope.setExtra("reservation createdAt", reservation.createdAt);
                                        scope.setExtra("reservation status", reservation.status);
                                    });
                                }
                                return [4 /*yield*/, returnNoticeNeeded(reservation)];
                            case 1:
                                if (!_a.sent()) return [3 /*break*/, 4];
                                return [4 /*yield*/, prisma_1.prisma
                                        .reservation({
                                        id: reservation.id,
                                    })
                                        .customer()
                                        .user()];
                            case 2:
                                user = _a.sent();
                                sendTransactionalEmail_1.sendTransactionalEmail({
                                    to: user.email,
                                    data: emails_1.emails.returnReminderData({
                                        name: user.firstName,
                                        returnDate: formatReservationReturnDate_1.formatReservationReturnDate(new Date(reservation.createdAt)),
                                    }),
                                });
                                return [4 /*yield*/, prisma_1.prisma.updateReservation({
                                        where: { id: reservation.id },
                                        data: { reminderSentAt: luxon_1.DateTime.local().toString() },
                                    })];
                            case 3:
                                _a.sent();
                                report.reservationsForWhichRemindersWereSent.push(reservation.reservationNumber);
                                _a.label = 4;
                            case 4: return [3 /*break*/, 6];
                            case 5:
                                err_1 = _a.sent();
                                report.errors.push(err_1);
                                if (shouldReportErrorsToSentry) {
                                    Sentry.captureException(err_1);
                                }
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, reservations_1 = reservations;
                _a.label = 2;
            case 2:
                if (!(_i < reservations_1.length)) return [3 /*break*/, 5];
                reservation = reservations_1[_i];
                return [5 /*yield**/, _loop_1(reservation)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5:
                console.log(report);
                return [2 /*return*/, report];
        }
    });
}); };
var returnNoticeNeeded = function (reservation) { return __awaiter(void 0, void 0, void 0, function () {
    var now, reservationCreatedAt, twentyEightToTwentyNineDaysAgo, customer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                now = luxon_1.DateTime.local();
                reservationCreatedAt = luxon_1.DateTime.fromISO(reservation.createdAt);
                twentyEightToTwentyNineDaysAgo = luxon_1.Interval.fromDateTimes(now.minus({ days: 29 }), now.minus({ days: 28 }));
                return [4 /*yield*/, prisma_1.prisma
                        .reservation({
                        id: reservation.id,
                    })
                        .customer()];
            case 1:
                customer = _a.sent();
                return [2 /*return*/, (twentyEightToTwentyNineDaysAgo.contains(reservationCreatedAt) &&
                        !reservation.reminderSentAt &&
                        customer.plan === "Essential" &&
                        !["Cancelled", "Completed"].includes(reservation.status))];
        }
    });
}); };
//# sourceMappingURL=sendReturnNotifications.js.map