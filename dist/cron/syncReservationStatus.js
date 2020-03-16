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
var utils_1 = require("../airtable/utils");
var prisma_1 = require("../prisma");
var utils_2 = require("../utils");
var sendTransactionalEmail_1 = require("../sendTransactionalEmail");
var server_1 = require("../server");
var Sentry = __importStar(require("@sentry/node"));
var errors_1 = require("../errors");
var emails_1 = require("../emails");
var shouldReportErrorsToSentry = process.env.NODE_ENV === "production";
// Set up Sentry, for error reporting
if (shouldReportErrorsToSentry) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
    });
}
function syncReservationStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var updatedReservations, errors, reservationsInAirtableButNotPrisma, allAirtableReservations, _loop_1, _i, allAirtableReservations_1, airtableReservation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    updatedReservations = [];
                    errors = [];
                    reservationsInAirtableButNotPrisma = [];
                    return [4 /*yield*/, utils_1.getAllReservations()];
                case 1:
                    allAirtableReservations = _a.sent();
                    _loop_1 = function (airtableReservation) {
                        var prismaReservation, prismaUser, returnedPhysicalProducts, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 10, , 11]);
                                    if (shouldReportErrorsToSentry) {
                                        Sentry.configureScope(function (scope) {
                                            scope.setExtra("reservationNumber", airtableReservation.fields.ID);
                                        });
                                    }
                                    return [4 /*yield*/, getPrismaReservationWithNeededFields(airtableReservation.fields.ID)];
                                case 1:
                                    prismaReservation = _a.sent();
                                    if (!prismaReservation) {
                                        reservationsInAirtableButNotPrisma.push(airtableReservation.fields.ID);
                                        if (shouldReportErrorsToSentry) {
                                            Sentry.captureException(new errors_1.SyncError("Reservation in airtable but not prisma"));
                                        }
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (!(airtableReservation.fields.Status === "Completed")) return [3 /*break*/, 7];
                                    if (!(prismaReservation.status !== "Completed")) return [3 /*break*/, 6];
                                    // Handle housekeeping
                                    updatedReservations.push(prismaReservation.reservationNumber);
                                    return [4 /*yield*/, prisma_1.prisma.user({
                                            email: airtableReservation.fields["User Email"][0],
                                        })];
                                case 2:
                                    prismaUser = _a.sent();
                                    returnedPhysicalProducts = prismaReservation.products.filter(function (p) {
                                        return [
                                            "Reservable",
                                            "NonReservable",
                                        ].includes(p.inventoryStatus);
                                    });
                                    // Update the status
                                    return [4 /*yield*/, prisma_1.prisma.updateReservation({
                                            data: { status: "Completed" },
                                            where: { id: prismaReservation.id },
                                        })
                                        // Email the user
                                    ];
                                case 3:
                                    // Update the status
                                    _a.sent();
                                    // Email the user
                                    sendYouCanNowReserveAgainEmail(prismaUser);
                                    //   Update the user's bag
                                    return [4 /*yield*/, updateUsersBagItemsOnCompletedReservation(prisma_1.prisma, prismaReservation, returnedPhysicalProducts)
                                        // Update the returnPackage on the shipment
                                    ];
                                case 4:
                                    //   Update the user's bag
                                    _a.sent();
                                    // Update the returnPackage on the shipment
                                    return [4 /*yield*/, updateReturnPackageOnCompletedReservation(prisma_1.prisma, prismaReservation, returnedPhysicalProducts)
                                        // Email an admin a confirmation email
                                    ];
                                case 5:
                                    // Update the returnPackage on the shipment
                                    _a.sent();
                                    // Email an admin a confirmation email
                                    sendTransactionalEmail_1.sendTransactionalEmail({
                                        to: process.env.OPERATIONS_ADMIN_EMAIL,
                                        data: emails_1.emails.reservationReturnConfirmationData(prismaReservation.reservationNumber, returnedPhysicalProducts.map(function (p) { return p.seasonsUID; }), prismaUser.email),
                                    });
                                    _a.label = 6;
                                case 6: return [3 /*break*/, 9];
                                case 7:
                                    if (!(airtableReservation.fields.Status !== prismaReservation.status)) return [3 /*break*/, 9];
                                    // If the reservation doesn't have a status of "Completed", just check to
                                    // see if we need to update the prisma reservation status and do so if needed
                                    updatedReservations.push(prismaReservation.reservationNumber);
                                    return [4 /*yield*/, prisma_1.prisma.updateReservation({
                                            data: {
                                                status: airtableToPrismaReservationStatus(airtableReservation.fields.Status),
                                            },
                                            where: { id: prismaReservation.id },
                                        })];
                                case 8:
                                    _a.sent();
                                    _a.label = 9;
                                case 9: return [3 /*break*/, 11];
                                case 10:
                                    err_1 = _a.sent();
                                    console.log(airtableReservation);
                                    console.log(err_1);
                                    errors.push(err_1);
                                    if (shouldReportErrorsToSentry) {
                                        Sentry.captureException(err_1);
                                    }
                                    return [3 /*break*/, 11];
                                case 11: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, allAirtableReservations_1 = allAirtableReservations;
                    _a.label = 2;
                case 2:
                    if (!(_i < allAirtableReservations_1.length)) return [3 /*break*/, 5];
                    airtableReservation = allAirtableReservations_1[_i];
                    return [5 /*yield**/, _loop_1(airtableReservation)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, {
                        updatedReservations: updatedReservations,
                        errors: errors,
                        reservationsInAirtableButNotPrisma: reservationsInAirtableButNotPrisma,
                    }];
            }
        });
    });
}
exports.syncReservationStatus = syncReservationStatus;
// *****************************************************************************
function sendYouCanNowReserveAgainEmail(user) {
    sendTransactionalEmail_1.sendTransactionalEmail({
        to: user.email,
        data: emails_1.emails.freeToReserveData(),
    });
}
function getPrismaReservationWithNeededFields(reservationNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, server_1.db.query.reservation({
                        where: { reservationNumber: reservationNumber },
                    }, "{\n        id\n        status\n        reservationNumber\n        products {\n            id\n            inventoryStatus\n            seasonsUID\n            productVariant {\n                id\n            }\n        }\n        customer {\n            id\n            detail {\n                shippingAddress {\n                    slug\n                }\n            }\n        }\n        returnedPackage {\n            id\n        }\n    }")];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res];
            }
        });
    });
}
function airtableToPrismaReservationStatus(airtableStatus) {
    return airtableStatus.replace(" ", "");
}
function updateUsersBagItemsOnCompletedReservation(prisma, prismaReservation, // actually a Prisma Reservation with fields specified in getPrismaReservationWithNeededFields
returnedPhysicalProducts // fields specified in getPrismaReservationWithNeededFields
) {
    return __awaiter(this, void 0, void 0, function () {
        var returnedPhysicalProductsProductVariantIDs, customerBagItems, _loop_2, _i, returnedPhysicalProductsProductVariantIDs_1, prodVarId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    returnedPhysicalProductsProductVariantIDs = returnedPhysicalProducts.map(function (p) { return p.productVariant.id; });
                    return [4 /*yield*/, server_1.db.query.bagItems({
                            where: { customer: { id: prismaReservation.customer.id } },
                        }, "{ \n        id\n        productVariant {\n            id\n        }\n    }")];
                case 1:
                    customerBagItems = _a.sent();
                    _loop_2 = function (prodVarId) {
                        var bagItem;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    bagItem = customerBagItems.find(function (val) { return val.productVariant.id === prodVarId; });
                                    if (!bagItem) {
                                        throw new Error("bagItem with productVariant id " + prodVarId + " not found for customer w/id " + prismaReservation.customer.id);
                                    }
                                    return [4 /*yield*/, prisma.deleteBagItem({ id: bagItem.id })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, returnedPhysicalProductsProductVariantIDs_1 = returnedPhysicalProductsProductVariantIDs;
                    _a.label = 2;
                case 2:
                    if (!(_i < returnedPhysicalProductsProductVariantIDs_1.length)) return [3 /*break*/, 5];
                    prodVarId = returnedPhysicalProductsProductVariantIDs_1[_i];
                    return [5 /*yield**/, _loop_2(prodVarId)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function updateReturnPackageOnCompletedReservation(prisma, prismaReservation, // actually a Prisma Reservation with fields specified in getPrismaReservationWithNeededFields
returnedPhysicalProducts // fields specified in getPrismaReservationWithNeededFields
) {
    return __awaiter(this, void 0, void 0, function () {
        var returnedPhysicalProductIDs, returnedProductVariantIDs, weight;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    returnedPhysicalProductIDs = returnedPhysicalProducts.map(function (p) {
                        return { id: p.id };
                    });
                    returnedProductVariantIDs = prismaReservation.products
                        .filter(function (p) { return p.inventoryStatus === "Reservable"; })
                        .map(function (prod) { return prod.productVariant.id; });
                    return [4 /*yield*/, utils_2.calcShipmentWeightFromProductVariantIDs(prisma, returnedProductVariantIDs)];
                case 1:
                    weight = _a.sent();
                    if (!(prismaReservation.returnedPackage != null)) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma.updatePackage({
                            data: {
                                items: { connect: returnedPhysicalProductIDs },
                                weight: weight,
                            },
                            where: { id: prismaReservation.returnedPackage.id },
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, prisma.updateReservation({
                        data: {
                            returnedPackage: {
                                create: {
                                    items: { connect: returnedPhysicalProductIDs },
                                    weight: weight,
                                    shippingLabel: {
                                        create: {},
                                    },
                                    fromAddress: {
                                        connect: {
                                            slug: prismaReservation.customer.detail.shippingAddress.slug,
                                        },
                                    },
                                    toAddress: {
                                        connect: {
                                            slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
                                        },
                                    },
                                },
                            },
                        },
                        where: {
                            id: prismaReservation.id,
                        },
                    })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=syncReservationStatus.js.map