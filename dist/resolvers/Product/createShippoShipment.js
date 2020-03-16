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
const utils_1 = require("../../utils");
function createShippoShipment(prisma, user, customer, shipmentWeight, insuranceAmount) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create Next Cleaners Address object
        const nextCleanersAddressPrisma = yield utils_1.getPrismaLocationFromSlug(prisma, process.env.SEASONS_CLEANER_LOCATION_SLUG);
        const nextCleanersAddressShippo = Object.assign(Object.assign({}, locationDataToShippoAddress(nextCleanersAddressPrisma)), seasonsHQOrCleanersSecondaryAddressFields());
        // Create customer address object
        const customerShippingAddressPrisma = yield prisma
            .customer({ id: customer.id })
            .detail()
            .shippingAddress();
        const customerPhoneNumber = yield prisma
            .customer({ id: customer.id })
            .detail()
            .phoneNumber();
        const insureShipmentForCustomer = yield prisma
            .customer({ id: customer.id })
            .detail()
            .insureShipment();
        const customerAddressShippo = Object.assign(Object.assign({}, locationDataToShippoAddress(customerShippingAddressPrisma)), { name: `${user.firstName} ${user.lastName}`, phone: customerPhoneNumber, country: "US", email: user.email });
        // Create parcel object
        const parcel = {
            // dimensions of seasons bag
            length: "20",
            width: "28",
            height: "5",
            distance_unit: "in",
            weight: shipmentWeight,
            mass_unit: "lb",
        };
        return [
            Object.assign({ address_from: nextCleanersAddressShippo, address_to: customerAddressShippo, parcels: [parcel] }, (insureShipmentForCustomer && {
                extra: {
                    insurance: {
                        amount: insuranceAmount.toString(),
                        currency: "USD",
                    },
                },
            })),
            {
                address_from: nextCleanersAddressShippo,
                address_to: customerAddressShippo,
                parcels: [parcel],
                extra: { is_return: true },
            },
        ];
        function seasonsHQOrCleanersSecondaryAddressFields() {
            return {
                country: "US",
                phone: "706-271-7092",
                email: "reservations@seasons.nyc",
            };
        }
    });
}
exports.createShippoShipment = createShippoShipment;
function locationDataToShippoAddress(location) {
    if (location == null) {
        throw new Error("can not extract values from null object");
    }
    return {
        name: location.name,
        company: location.company,
        street1: location.address1,
        street2: location.address2,
        city: location.city,
        state: location.state,
        zip: location.zipCode,
    };
}
exports.locationDataToShippoAddress = locationDataToShippoAddress;
//# sourceMappingURL=createShippoShipment.js.map