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
var utils_1 = require("../../../utils");
var apollo_server_1 = require("apollo-server");
var utils_2 = require("../../../auth/utils");
var getLatestReservation_1 = require("../getLatestReservation");
var utils_3 = require("../utils");
var getHeldPhysicalProducts_1 = require("../getHeldPhysicalProducts");
var updateProductVariantCounts_1 = require("../updateProductVariantCounts");
var markPhysicalProductsReservedOnAirtable_1 = require("../markPhysicalProductsReservedOnAirtable");
var createShippoShipment_1 = require("../createShippoShipment");
var createReservationData_1 = require("../createReservationData");
var utils_4 = require("../../../airtable/utils");
var sendReservationConfirmationEmail_1 = require("../sendReservationConfirmationEmail");
var errors_1 = require("../../../errors");
var Sentry = __importStar(require("@sentry/node"));
var getNewProductVariantsBeingReserved_1 = require("../getNewProductVariantsBeingReserved");
var markPhysicalProductsReservedOnPrisma_1 = require("../markPhysicalProductsReservedOnPrisma");
var createShippingLabel_1 = require("../createShippingLabel");
var updateAddedBagItems_1 = require("../updateAddedBagItems");
function reserveItems(parent, _a, ctx, info) {
    var items = _a.items;
    return __awaiter(this, void 0, void 0, function () {
        var reservationReturnData, rollbackFuncs, userRequestObject, customer, lastReservation, newProductVariantsBeingReserved, heldPhysicalProducts, _b, productsBeingReserved, physicalProductsBeingReserved, rollbackUpdateProductVariantCounts, rollbackPrismaPhysicalProductStatuses, rollbackAirtablePhysicalProductStatuses, shipmentWeight, insuranceAmount, _c, seasonsToShippoShipment, customerToSeasonsShipment, seasonsToCustomerTransaction, customerToSeasonsTransaction, rollbackBagItemsUpdate, reservationData, _d, prismaReservation, rollbackPrismaReservationCreation, _e, rollbackAirtableReservationCreation, err_1, _i, rollbackFuncs_1, rollbackFunc, err2_1;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    rollbackFuncs = [];
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 21, , 28]);
                    // Do a quick validation on the data
                    if (items.length < 3) {
                        throw new apollo_server_1.ApolloError("Must supply at least three product variant ids", "515");
                    }
                    return [4 /*yield*/, utils_2.getUserRequestObject(ctx)];
                case 2:
                    userRequestObject = _f.sent();
                    return [4 /*yield*/, utils_2.getCustomerFromContext(ctx)
                        // Figure out which items the user is reserving anew and which they already have
                    ];
                case 3:
                    customer = _f.sent();
                    return [4 /*yield*/, getLatestReservation_1.getLatestReservation(ctx.prisma, ctx.db, customer)];
                case 4:
                    lastReservation = _f.sent();
                    utils_3.checkLastReservation(lastReservation);
                    return [4 /*yield*/, getNewProductVariantsBeingReserved_1.getNewProductVariantsBeingReserved(lastReservation, items)];
                case 5:
                    newProductVariantsBeingReserved = _f.sent();
                    return [4 /*yield*/, getHeldPhysicalProducts_1.getHeldPhysicalProducts(ctx, lastReservation)
                        // Get product data, update variant counts, update physical product statuses
                    ];
                case 6:
                    heldPhysicalProducts = _f.sent();
                    return [4 /*yield*/, updateProductVariantCounts_1.updateProductVariantCounts(newProductVariantsBeingReserved, ctx)];
                case 7:
                    _b = _f.sent(), productsBeingReserved = _b[0], physicalProductsBeingReserved = _b[1], rollbackUpdateProductVariantCounts = _b[2];
                    rollbackFuncs.push(rollbackUpdateProductVariantCounts);
                    return [4 /*yield*/, markPhysicalProductsReservedOnPrisma_1.markPhysicalProductsReservedOnPrisma(ctx.prisma, physicalProductsBeingReserved)];
                case 8:
                    rollbackPrismaPhysicalProductStatuses = _f.sent();
                    rollbackFuncs.push(rollbackPrismaPhysicalProductStatuses);
                    return [4 /*yield*/, markPhysicalProductsReservedOnAirtable_1.markPhysicalProductsReservedOnAirtable(physicalProductsBeingReserved)];
                case 9:
                    rollbackAirtablePhysicalProductStatuses = _f.sent();
                    rollbackFuncs.push(rollbackAirtablePhysicalProductStatuses);
                    return [4 /*yield*/, utils_1.calcShipmentWeightFromProductVariantIDs(ctx.prisma, newProductVariantsBeingReserved)];
                case 10:
                    shipmentWeight = _f.sent();
                    return [4 /*yield*/, utils_1.calcTotalRetailPriceFromProductVariantIDs(ctx.prisma, newProductVariantsBeingReserved)];
                case 11:
                    insuranceAmount = _f.sent();
                    return [4 /*yield*/, createShippoShipment_1.createShippoShipment(ctx.prisma, userRequestObject, customer, shipmentWeight, insuranceAmount)];
                case 12:
                    _c = _f.sent(), seasonsToShippoShipment = _c[0], customerToSeasonsShipment = _c[1];
                    return [4 /*yield*/, createShippingLabel_1.createShippingLabel({
                            shipment: seasonsToShippoShipment,
                            carrier_account: process.env.UPS_ACCOUNT_ID,
                            servicelevel_token: "ups_ground",
                        })];
                case 13:
                    seasonsToCustomerTransaction = _f.sent();
                    return [4 /*yield*/, createShippingLabel_1.createShippingLabel({
                            shipment: customerToSeasonsShipment,
                            carrier_account: process.env.UPS_ACCOUNT_ID,
                            servicelevel_token: "ups_ground",
                        })
                        // Update relevant BagItems
                    ];
                case 14:
                    customerToSeasonsTransaction = _f.sent();
                    return [4 /*yield*/, updateAddedBagItems_1.markBagItemsReserved(ctx.prisma, customer.id, newProductVariantsBeingReserved)];
                case 15:
                    rollbackBagItemsUpdate = _f.sent();
                    rollbackFuncs.push(rollbackBagItemsUpdate);
                    return [4 /*yield*/, createReservationData_1.createReservationData(ctx.prisma, seasonsToCustomerTransaction, customerToSeasonsTransaction, userRequestObject, customer, shipmentWeight, physicalProductsBeingReserved, heldPhysicalProducts)];
                case 16:
                    reservationData = _f.sent();
                    return [4 /*yield*/, utils_3.createPrismaReservation(ctx.prisma, reservationData)];
                case 17:
                    _d = _f.sent(), prismaReservation = _d[0], rollbackPrismaReservationCreation = _d[1];
                    rollbackFuncs.push(rollbackPrismaReservationCreation);
                    return [4 /*yield*/, utils_4.createAirtableReservation(userRequestObject.email, reservationData, seasonsToCustomerTransaction.formatted_error, customerToSeasonsTransaction.formatted_error)];
                case 18:
                    _e = _f.sent(), rollbackAirtableReservationCreation = _e[1];
                    rollbackFuncs.push(rollbackAirtableReservationCreation);
                    // Send confirmation email
                    return [4 /*yield*/, sendReservationConfirmationEmail_1.sendReservationConfirmationEmail(ctx.prisma, userRequestObject, productsBeingReserved, prismaReservation)
                        // Get return data
                    ];
                case 19:
                    // Send confirmation email
                    _f.sent();
                    return [4 /*yield*/, ctx.db.query.reservation({ where: { id: prismaReservation.id } }, info)];
                case 20:
                    // Get return data
                    reservationReturnData = _f.sent();
                    return [3 /*break*/, 28];
                case 21:
                    err_1 = _f.sent();
                    _i = 0, rollbackFuncs_1 = rollbackFuncs;
                    _f.label = 22;
                case 22:
                    if (!(_i < rollbackFuncs_1.length)) return [3 /*break*/, 27];
                    rollbackFunc = rollbackFuncs_1[_i];
                    _f.label = 23;
                case 23:
                    _f.trys.push([23, 25, , 26]);
                    return [4 /*yield*/, rollbackFunc()];
                case 24:
                    _f.sent();
                    return [3 /*break*/, 26];
                case 25:
                    err2_1 = _f.sent();
                    Sentry.configureScope(function (scope) {
                        scope.setTag("flag", "data-corruption");
                        scope.setExtra("item ids", "" + items);
                        scope.setExtra("original error", err_1);
                    });
                    Sentry.captureException(new errors_1.RollbackError(err2_1));
                    return [3 /*break*/, 26];
                case 26:
                    _i++;
                    return [3 /*break*/, 22];
                case 27: throw err_1;
                case 28: return [2 /*return*/, reservationReturnData];
            }
        });
    });
}
exports.reserveItems = reserveItems;
//# sourceMappingURL=reserveItems.js.map