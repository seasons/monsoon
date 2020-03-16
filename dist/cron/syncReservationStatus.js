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
const utils_1 = require("../airtable/utils");
const prisma_1 = require("../prisma");
const utils_2 = require("../utils");
const sendTransactionalEmail_1 = require("../sendTransactionalEmail");
const server_1 = require("../server");
const Sentry = __importStar(require("@sentry/node"));
const errors_1 = require("../errors");
const emails_1 = require("../emails");
const shouldReportErrorsToSentry = process.env.NODE_ENV === "production";
// Set up Sentry, for error reporting
if (shouldReportErrorsToSentry) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
    });
}
function syncReservationStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        const updatedReservations = [];
        const errors = [];
        const reservationsInAirtableButNotPrisma = [];
        const allAirtableReservations = yield utils_1.getAllReservations();
        for (const airtableReservation of allAirtableReservations) {
            try {
                if (shouldReportErrorsToSentry) {
                    Sentry.configureScope(scope => {
                        scope.setExtra("reservationNumber", airtableReservation.fields.ID);
                    });
                }
                const prismaReservation = yield getPrismaReservationWithNeededFields(airtableReservation.fields.ID);
                if (!prismaReservation) {
                    reservationsInAirtableButNotPrisma.push(airtableReservation.fields.ID);
                    if (shouldReportErrorsToSentry) {
                        Sentry.captureException(new errors_1.SyncError("Reservation in airtable but not prisma"));
                    }
                    continue;
                }
                // If the reservation has status of "Completed", handle it seperately.
                if (airtableReservation.fields.Status === "Completed") {
                    if (prismaReservation.status !== "Completed") {
                        // Handle housekeeping
                        updatedReservations.push(prismaReservation.reservationNumber);
                        const prismaUser = yield prisma_1.prisma.user({
                            email: airtableReservation.fields["User Email"][0],
                        });
                        const returnedPhysicalProducts = prismaReservation.products.filter(p => [
                            "Reservable",
                            "NonReservable",
                        ].includes(p.inventoryStatus));
                        // Update the status
                        yield prisma_1.prisma.updateReservation({
                            data: { status: "Completed" },
                            where: { id: prismaReservation.id },
                        });
                        // Email the user
                        sendYouCanNowReserveAgainEmail(prismaUser);
                        //   Update the user's bag
                        yield updateUsersBagItemsOnCompletedReservation(prisma_1.prisma, prismaReservation, returnedPhysicalProducts);
                        // Update the returnPackage on the shipment
                        yield updateReturnPackageOnCompletedReservation(prisma_1.prisma, prismaReservation, returnedPhysicalProducts);
                        // Email an admin a confirmation email
                        sendTransactionalEmail_1.sendTransactionalEmail({
                            to: process.env.OPERATIONS_ADMIN_EMAIL,
                            data: emails_1.emails.reservationReturnConfirmationData(prismaReservation.reservationNumber, returnedPhysicalProducts.map(p => p.seasonsUID), prismaUser.email),
                        });
                    }
                }
                else if (airtableReservation.fields.Status !== prismaReservation.status) {
                    // If the reservation doesn't have a status of "Completed", just check to
                    // see if we need to update the prisma reservation status and do so if needed
                    updatedReservations.push(prismaReservation.reservationNumber);
                    yield prisma_1.prisma.updateReservation({
                        data: {
                            status: airtableToPrismaReservationStatus(airtableReservation.fields.Status),
                        },
                        where: { id: prismaReservation.id },
                    });
                }
            }
            catch (err) {
                console.log(airtableReservation);
                console.log(err);
                errors.push(err);
                if (shouldReportErrorsToSentry) {
                    Sentry.captureException(err);
                }
            }
        }
        return {
            updatedReservations,
            errors,
            reservationsInAirtableButNotPrisma,
        };
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
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield server_1.db.query.reservation({
            where: { reservationNumber },
        }, `{
        id
        status
        reservationNumber
        products {
            id
            inventoryStatus
            seasonsUID
            productVariant {
                id
            }
        }
        customer {
            id
            detail {
                shippingAddress {
                    slug
                }
            }
        }
        returnedPackage {
            id
        }
    }`);
        return res;
    });
}
function airtableToPrismaReservationStatus(airtableStatus) {
    return airtableStatus.replace(" ", "");
}
function updateUsersBagItemsOnCompletedReservation(prisma, prismaReservation, // actually a Prisma Reservation with fields specified in getPrismaReservationWithNeededFields
returnedPhysicalProducts // fields specified in getPrismaReservationWithNeededFields
) {
    return __awaiter(this, void 0, void 0, function* () {
        const returnedPhysicalProductsProductVariantIDs = returnedPhysicalProducts.map(p => p.productVariant.id);
        const customerBagItems = yield server_1.db.query.bagItems({
            where: { customer: { id: prismaReservation.customer.id } },
        }, `{ 
        id
        productVariant {
            id
        }
    }`);
        for (let prodVarId of returnedPhysicalProductsProductVariantIDs) {
            const bagItem = customerBagItems.find(val => val.productVariant.id === prodVarId);
            if (!bagItem) {
                throw new Error(`bagItem with productVariant id ${prodVarId} not found for customer w/id ${prismaReservation.customer.id}`);
            }
            yield prisma.deleteBagItem({ id: bagItem.id });
        }
    });
}
function updateReturnPackageOnCompletedReservation(prisma, prismaReservation, // actually a Prisma Reservation with fields specified in getPrismaReservationWithNeededFields
returnedPhysicalProducts // fields specified in getPrismaReservationWithNeededFields
) {
    return __awaiter(this, void 0, void 0, function* () {
        const returnedPhysicalProductIDs = returnedPhysicalProducts.map(p => {
            return { id: p.id };
        });
        const returnedProductVariantIDs = prismaReservation.products
            .filter(p => p.inventoryStatus === "Reservable")
            .map(prod => prod.productVariant.id);
        const weight = yield utils_2.calcShipmentWeightFromProductVariantIDs(prisma, returnedProductVariantIDs);
        if (prismaReservation.returnedPackage != null) {
            yield prisma.updatePackage({
                data: {
                    items: { connect: returnedPhysicalProductIDs },
                    weight,
                },
                where: { id: prismaReservation.returnedPackage.id },
            });
        }
        else {
            yield prisma.updateReservation({
                data: {
                    returnedPackage: {
                        create: {
                            items: { connect: returnedPhysicalProductIDs },
                            weight,
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
            });
        }
    });
}
//# sourceMappingURL=syncReservationStatus.js.map