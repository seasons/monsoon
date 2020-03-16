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
const apollo_server_1 = require("apollo-server");
function createReservationData(prisma, seasonsToCustomerTransaction, customerToSeasonsTransaction, user, customer, shipmentWeight, physicalProductsBeingReserved, heldPhysicalProducts) {
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
        const customerShippingAddressRecordID = yield prisma
            .customer({ id: customer.id })
            .detail()
            .shippingAddress()
            .id();
        const uniqueReservationNumber = yield getUniqueReservationNumber(prisma);
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
exports.createReservationData = createReservationData;
function getUniqueReservationNumber(prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        let reservationNumber;
        let foundUnique = false;
        while (!foundUnique) {
            reservationNumber = Math.floor(Math.random() * 900000000) + 100000000;
            const reservationWithThatNumber = yield prisma.reservation({
                reservationNumber,
            });
            foundUnique = !reservationWithThatNumber;
        }
        return reservationNumber;
    });
}
//# sourceMappingURL=createReservationData.js.map