"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
const db_service_1 = require("../../../prisma/db.service");
const common_1 = require("@nestjs/common");
const apollo_server_1 = require("apollo-server");
const lodash_1 = require("lodash");
const client_service_1 = require("../../../prisma/client.service");
const product_utils_service_1 = require("./product.utils.service");
const productVariant_service_1 = require("./productVariant.service");
const physicalProduct_utils_service_1 = require("./physicalProduct.utils.service");
const airtable_service_1 = require("../../Airtable/services/airtable.service");
const shipping_service_1 = require("../../Shipping/services/shipping.service");
const email_service_1 = require("../../Email/services/email.service");
const errors_1 = require("../../../errors");
const Sentry = __importStar(require("@sentry/node"));
const reservation_utils_service_1 = require("./reservation.utils.service");
let ReservationService = class ReservationService {
    constructor(db, prisma, productUtils, productVariantService, physicalProductService, airtableService, shippingService, emails, reservationUtils) {
        this.db = db;
        this.prisma = prisma;
        this.productUtils = productUtils;
        this.productVariantService = productVariantService;
        this.physicalProductService = physicalProductService;
        this.airtableService = airtableService;
        this.shippingService = shippingService;
        this.emails = emails;
        this.reservationUtils = reservationUtils;
    }
    reserveItems(items, user, customer, info) {
        return __awaiter(this, void 0, void 0, function* () {
            let reservationReturnData;
            const rollbackFuncs = [];
            try {
                // Do a quick validation on the data
                if (items.length < 3) {
                    throw new apollo_server_1.ApolloError("Must supply at least three product variant ids", "515");
                }
                // Figure out which items the user is reserving anew and which they already have
                const lastReservation = yield this.getLatestReservation(customer);
                this.checkLastReservation(lastReservation);
                const newProductVariantsBeingReserved = yield this.getNewProductVariantsBeingReserved(lastReservation, items);
                const heldPhysicalProducts = yield this.getHeldPhysicalProducts(customer, lastReservation);
                // Get product data, update variant counts, update physical product statuses
                const [productsBeingReserved, physicalProductsBeingReserved, rollbackUpdateProductVariantCounts,] = yield this.productVariantService.updateProductVariantCounts(newProductVariantsBeingReserved);
                rollbackFuncs.push(rollbackUpdateProductVariantCounts);
                // tslint:disable-next-line:max-line-length
                const rollbackPrismaPhysicalProductStatuses = yield this.physicalProductService.markPhysicalProductsReservedOnPrisma(physicalProductsBeingReserved);
                rollbackFuncs.push(rollbackPrismaPhysicalProductStatuses);
                const rollbackAirtablePhysicalProductStatuses = yield this.airtableService.markPhysicalProductsReservedOnAirtable(physicalProductsBeingReserved);
                rollbackFuncs.push(rollbackAirtablePhysicalProductStatuses);
                const [seasonsToCustomerTransaction, customerToSeasonsTransaction,] = yield this.shippingService.createReservationShippingLabels(newProductVariantsBeingReserved, user, customer);
                // Update relevant BagItems
                const rollbackBagItemsUpdate = yield this.markBagItemsReserved(customer.id, newProductVariantsBeingReserved);
                rollbackFuncs.push(rollbackBagItemsUpdate);
                // Create reservation records in prisma and airtable
                const reservationData = yield this.createReservationData(seasonsToCustomerTransaction, customerToSeasonsTransaction, user, customer, yield this.shippingService.calcShipmentWeightFromProductVariantIDs(newProductVariantsBeingReserved), physicalProductsBeingReserved, heldPhysicalProducts);
                const [prismaReservation, rollbackPrismaReservationCreation,] = yield this.createPrismaReservation(reservationData);
                rollbackFuncs.push(rollbackPrismaReservationCreation);
                const [, rollbackAirtableReservationCreation,] = yield this.airtableService.createAirtableReservation(user.email, reservationData, seasonsToCustomerTransaction.formatted_error, customerToSeasonsTransaction.formatted_error);
                rollbackFuncs.push(rollbackAirtableReservationCreation);
                // Send confirmation email
                yield this.emails.sendReservationConfirmationEmail(user, productsBeingReserved, prismaReservation);
                // Get return data
                reservationReturnData = yield this.db.query.reservation({ where: { id: prismaReservation.id } }, info);
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
    getLatestReservation(customer) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const allCustomerReservationsOrderedByCreatedAt = yield this.prisma.client
                    .customer({ id: customer.id })
                    .reservations({
                    orderBy: "createdAt_DESC",
                });
                const latestReservation = lodash_1.head(allCustomerReservationsOrderedByCreatedAt);
                if (latestReservation == null) {
                    return resolve(null);
                }
                else {
                    const res = (yield this.db.query.reservation({
                        where: { id: latestReservation.id },
                    }, `{ 
                id  
                products {
                    id
                    seasonsUID
                    inventoryStatus
                    productStatus
                    productVariant {
                        id
                    }
                }
                status
                reservationNumber
             }`));
                    return resolve(res);
                }
            }));
        });
    }
    checkLastReservation(lastReservation) {
        if (!!lastReservation &&
            ![
                "Completed",
                "Cancelled",
            ].includes(lastReservation.status)) {
            throw new apollo_server_1.ApolloError(`Last reservation has non-completed, non-cancelled status. Last Reservation number, status: ${lastReservation.reservationNumber}, ${lastReservation.status}`);
        }
    }
    getNewProductVariantsBeingReserved(lastReservation, items) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (lastReservation == null) {
                    return resolve(items);
                }
                const productVariantsInLastReservation = lastReservation.products.map(prod => prod.productVariant.id);
                const newProductVariantBeingReserved = items.filter(prodVarId => {
                    const notInLastReservation = !productVariantsInLastReservation.includes(prodVarId);
                    const inLastReservationButNowReservable = productVariantsInLastReservation.includes(prodVarId) &&
                        this.reservationUtils.inventoryStatusOf(lastReservation, prodVarId) === "Reservable";
                    return notInLastReservation || inLastReservationButNowReservable;
                });
                resolve(newProductVariantBeingReserved);
            }));
        });
    }
    getHeldPhysicalProducts(customer, lastReservation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (lastReservation == null)
                return [];
            const reservedBagItems = yield this.productUtils.getReservedBagItems(customer);
            const reservedProductVariantIds = reservedBagItems.map(a => a.productVariant.id);
            return lastReservation.products
                .filter(prod => prod.inventoryStatus === "Reserved")
                .filter(a => reservedProductVariantIds.includes(a.productVariant.id));
        });
    }
    markBagItemsReserved(customerId, productVariantIds) {
        return __awaiter(this, void 0, void 0, function* () {
            // Update the bag items
            const bagItemsToUpdate = yield this.prisma.client.bagItems({
                where: {
                    customer: {
                        id: customerId,
                    },
                    productVariant: {
                        id_in: productVariantIds,
                    },
                    status: "Added",
                },
            });
            const bagItemsToUpdateIds = bagItemsToUpdate.map(a => a.id);
            yield this.prisma.client.updateManyBagItems({
                where: { id_in: bagItemsToUpdateIds },
                data: {
                    status: "Reserved",
                },
            });
            // Create and return a rollback function
            const rollbackAddedBagItems = () => __awaiter(this, void 0, void 0, function* () {
                yield this.prisma.client.updateManyBagItems({
                    where: { id_in: bagItemsToUpdateIds },
                    data: {
                        status: "Added",
                    },
                });
            });
            return rollbackAddedBagItems;
        });
    }
    createReservationData(seasonsToCustomerTransaction, customerToSeasonsTransaction, user, customer, shipmentWeight, physicalProductsBeingReserved, heldPhysicalProducts) {
        return __awaiter(this, void 0, void 0, function* () {
            const allPhysicalProductsInReservation = [
                ...physicalProductsBeingReserved,
                ...heldPhysicalProducts,
            ];
            if (allPhysicalProductsInReservation.length > 3) {
                throw new apollo_server_1.ApolloError("Can not reserve more than 3 items at a time");
            }
            const physicalProductSUIDs = allPhysicalProductsInReservation.map(p => ({
                seasonsUID: p.seasonsUID,
            }));
            const customerShippingAddressRecordID = yield this.prisma.client
                .customer({ id: customer.id })
                .detail()
                .shippingAddress()
                .id();
            const uniqueReservationNumber = yield this.getUniqueReservationNumber();
            return {
                products: {
                    connect: physicalProductSUIDs,
                },
                customer: {
                    connect: {
                        id: customer.id,
                    },
                },
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                sentPackage: {
                    create: {
                        weight: shipmentWeight,
                        items: {
                            // need to include the type on the function passed into map
                            // or we get build errors comlaining about the type here
                            connect: physicalProductsBeingReserved.map((prod) => {
                                return { id: prod.id };
                            }),
                        },
                        shippingLabel: {
                            create: {
                                image: seasonsToCustomerTransaction.label_url || "",
                                trackingNumber: seasonsToCustomerTransaction.tracking_number || "",
                                trackingURL: seasonsToCustomerTransaction.tracking_url_provider || "",
                                name: "UPS",
                            },
                        },
                        fromAddress: {
                            connect: {
                                slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
                            },
                        },
                        toAddress: {
                            connect: { id: customerShippingAddressRecordID },
                        },
                    },
                },
                returnedPackage: {
                    create: {
                        shippingLabel: {
                            create: {
                                image: customerToSeasonsTransaction.label_url || "",
                                trackingNumber: customerToSeasonsTransaction.tracking_number || "",
                                trackingURL: customerToSeasonsTransaction.tracking_url_provider || "",
                                name: "UPS",
                            },
                        },
                        fromAddress: {
                            connect: {
                                id: customerShippingAddressRecordID,
                            },
                        },
                        toAddress: {
                            connect: {
                                slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
                            },
                        },
                    },
                },
                reservationNumber: uniqueReservationNumber,
                location: {
                    connect: {
                        slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
                    },
                },
                shipped: false,
                status: "InQueue",
            };
        });
    }
    getUniqueReservationNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            let reservationNumber;
            let foundUnique = false;
            while (!foundUnique) {
                reservationNumber = Math.floor(Math.random() * 900000000) + 100000000;
                const reservationWithThatNumber = yield this.prisma.client.reservation({
                    reservationNumber,
                });
                foundUnique = !reservationWithThatNumber;
            }
            return reservationNumber;
        });
    }
    /* Returns [createdReservation, rollbackFunc] */
    createPrismaReservation(reservationData) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservation = yield this.prisma.client.createReservation(reservationData);
            const rollbackPrismaReservation = () => __awaiter(this, void 0, void 0, function* () {
                yield this.prisma.client.deleteReservation({ id: reservation.id });
            });
            return [reservation, rollbackPrismaReservation];
        });
    }
};
ReservationService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_service_1.DBService,
        client_service_1.PrismaClientService,
        product_utils_service_1.ProductUtilsService,
        productVariant_service_1.ProductVariantService,
        physicalProduct_utils_service_1.PhysicalProductService,
        airtable_service_1.AirtableService,
        shipping_service_1.ShippingService,
        email_service_1.EmailService,
        reservation_utils_service_1.ReservationUtilsService])
], ReservationService);
exports.ReservationService = ReservationService;
//# sourceMappingURL=reservation.service.js.map