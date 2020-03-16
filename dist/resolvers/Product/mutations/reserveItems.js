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
const utils_1 = require("../../../utils");
const apollo_server_1 = require("apollo-server");
const utils_2 = require("../../../auth/utils");
const getLatestReservation_1 = require("../getLatestReservation");
const utils_3 = require("../utils");
const getHeldPhysicalProducts_1 = require("../getHeldPhysicalProducts");
const updateProductVariantCounts_1 = require("../updateProductVariantCounts");
const markPhysicalProductsReservedOnAirtable_1 = require("../markPhysicalProductsReservedOnAirtable");
const createShippoShipment_1 = require("../createShippoShipment");
const createReservationData_1 = require("../createReservationData");
const utils_4 = require("../../../airtable/utils");
const sendReservationConfirmationEmail_1 = require("../sendReservationConfirmationEmail");
const errors_1 = require("../../../errors");
const Sentry = __importStar(require("@sentry/node"));
const getNewProductVariantsBeingReserved_1 = require("../getNewProductVariantsBeingReserved");
const markPhysicalProductsReservedOnPrisma_1 = require("../markPhysicalProductsReservedOnPrisma");
const createShippingLabel_1 = require("../createShippingLabel");
const updateAddedBagItems_1 = require("../updateAddedBagItems");
function reserveItems(parent, { items }, ctx, info) {
    return __awaiter(this, void 0, void 0, function* () {
        let reservationReturnData;
        const rollbackFuncs = [];
        try {
            // Do a quick validation on the data
            if (items.length < 3) {
                throw new apollo_server_1.ApolloError("Must supply at least three product variant ids", "515");
            }
            // Get user data
            const userRequestObject = yield utils_2.getUserRequestObject(ctx);
            const customer = yield utils_2.getCustomerFromContext(ctx);
            // Figure out which items the user is reserving anew and which they already have
            const lastReservation = yield getLatestReservation_1.getLatestReservation(ctx.prisma, ctx.db, customer);
            utils_3.checkLastReservation(lastReservation);
            const newProductVariantsBeingReserved = yield getNewProductVariantsBeingReserved_1.getNewProductVariantsBeingReserved(lastReservation, items);
            const heldPhysicalProducts = yield getHeldPhysicalProducts_1.getHeldPhysicalProducts(ctx, lastReservation);
            // Get product data, update variant counts, update physical product statuses
            const [productsBeingReserved, physicalProductsBeingReserved, rollbackUpdateProductVariantCounts,] = yield updateProductVariantCounts_1.updateProductVariantCounts(newProductVariantsBeingReserved, ctx);
            rollbackFuncs.push(rollbackUpdateProductVariantCounts);
            const rollbackPrismaPhysicalProductStatuses = yield markPhysicalProductsReservedOnPrisma_1.markPhysicalProductsReservedOnPrisma(ctx.prisma, physicalProductsBeingReserved);
            rollbackFuncs.push(rollbackPrismaPhysicalProductStatuses);
            const rollbackAirtablePhysicalProductStatuses = yield markPhysicalProductsReservedOnAirtable_1.markPhysicalProductsReservedOnAirtable(physicalProductsBeingReserved);
            rollbackFuncs.push(rollbackAirtablePhysicalProductStatuses);
            // Create shipping labels.
            const shipmentWeight = yield utils_1.calcShipmentWeightFromProductVariantIDs(ctx.prisma, newProductVariantsBeingReserved);
            const insuranceAmount = yield utils_1.calcTotalRetailPriceFromProductVariantIDs(ctx.prisma, newProductVariantsBeingReserved);
            const [seasonsToShippoShipment, customerToSeasonsShipment,] = yield createShippoShipment_1.createShippoShipment(ctx.prisma, userRequestObject, customer, shipmentWeight, insuranceAmount);
            const seasonsToCustomerTransaction = yield createShippingLabel_1.createShippingLabel({
                shipment: seasonsToShippoShipment,
                carrier_account: process.env.UPS_ACCOUNT_ID,
                servicelevel_token: "ups_ground",
            });
            const customerToSeasonsTransaction = yield createShippingLabel_1.createShippingLabel({
                shipment: customerToSeasonsShipment,
                carrier_account: process.env.UPS_ACCOUNT_ID,
                servicelevel_token: "ups_ground",
            });
            // Update relevant BagItems
            const rollbackBagItemsUpdate = yield updateAddedBagItems_1.markBagItemsReserved(ctx.prisma, customer.id, newProductVariantsBeingReserved);
            rollbackFuncs.push(rollbackBagItemsUpdate);
            // Create reservation records in prisma and airtable
            const reservationData = yield createReservationData_1.createReservationData(ctx.prisma, seasonsToCustomerTransaction, customerToSeasonsTransaction, userRequestObject, customer, shipmentWeight, physicalProductsBeingReserved, heldPhysicalProducts);
            const [prismaReservation, rollbackPrismaReservationCreation,] = yield utils_3.createPrismaReservation(ctx.prisma, reservationData);
            rollbackFuncs.push(rollbackPrismaReservationCreation);
            const [, rollbackAirtableReservationCreation,] = yield utils_4.createAirtableReservation(userRequestObject.email, reservationData, seasonsToCustomerTransaction.formatted_error, customerToSeasonsTransaction.formatted_error);
            rollbackFuncs.push(rollbackAirtableReservationCreation);
            // Send confirmation email
            yield sendReservationConfirmationEmail_1.sendReservationConfirmationEmail(ctx.prisma, userRequestObject, productsBeingReserved, prismaReservation);
            // Get return data
            reservationReturnData = yield ctx.db.query.reservation({ where: { id: prismaReservation.id } }, info);
        }
        catch (err) {
            for (const rollbackFunc of rollbackFuncs) {
                try {
                    yield rollbackFunc();
                }
                catch (err2) {
                    Sentry.configureScope(scope => {
                        scope.setTag("flag", "data-corruption");
                        scope.setExtra(`item ids`, `${items}`);
                        scope.setExtra(`original error`, err);
                    });
                    Sentry.captureException(new errors_1.RollbackError(err2));
                }
            }
            throw err;
        }
        return reservationReturnData;
    });
}
exports.reserveItems = reserveItems;
//# sourceMappingURL=reserveItems.js.map