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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_service_1 = require("../../../prisma/client.service");
const utils_service_1 = require("../../Utils/utils.service");
const shippo_1 = __importDefault(require("shippo"));
let ShippingService = class ShippingService {
    constructor(prisma, utilsService) {
        this.prisma = prisma;
        this.utilsService = utilsService;
        this.shippo = shippo_1.default(process.env.SHIPPO_API_KEY);
    }
    createReservationShippingLabels(newProductVariantsBeingReserved, user, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            const shipmentWeight = yield this.calcShipmentWeightFromProductVariantIDs(newProductVariantsBeingReserved);
            const insuranceAmount = yield this.calcTotalRetailPriceFromProductVariantIDs(newProductVariantsBeingReserved);
            const [seasonsToShippoShipment, customerToSeasonsShipment,] = yield this.createShippoShipment(user, customer, shipmentWeight, insuranceAmount);
            const seasonsToCustomerTransaction = yield this.createShippingLabel({
                shipment: seasonsToShippoShipment,
                carrier_account: process.env.UPS_ACCOUNT_ID,
                servicelevel_token: "ups_ground",
            });
            const customerToSeasonsTransaction = yield this.createShippingLabel({
                shipment: customerToSeasonsShipment,
                carrier_account: process.env.UPS_ACCOUNT_ID,
                servicelevel_token: "ups_ground",
            });
            return [seasonsToCustomerTransaction, customerToSeasonsTransaction];
        });
    }
    calcShipmentWeightFromProductVariantIDs(itemIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            const shippingBagWeight = 1;
            const productVariants = yield this.prisma.client.productVariants({
                where: { id_in: itemIDs },
            });
            return productVariants.reduce(function addProductWeight(acc, curProdVar) {
                return acc + curProdVar.weight;
            }, shippingBagWeight);
        });
    }
    calcTotalRetailPriceFromProductVariantIDs(itemIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield this.prisma.client.products({
                where: {
                    variants_some: {
                        id_in: itemIDs,
                    },
                },
            });
            return products.reduce((acc, prod) => acc + prod.retailPrice, 0);
        });
    }
    createShippoShipment(user, customer, shipmentWeight, insuranceAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create Next Cleaners Address object
            const nextCleanersAddressPrisma = yield this.utilsService.getPrismaLocationFromSlug(process.env.SEASONS_CLEANER_LOCATION_SLUG || "seasons-cleaners-official");
            const nextCleanersAddressShippo = Object.assign(Object.assign({}, this.locationDataToShippoAddress(nextCleanersAddressPrisma)), this.seasonsHQOrCleanersSecondaryAddressFields());
            // Create customer address object
            const customerShippingAddressPrisma = yield this.prisma.client
                .customer({ id: customer.id })
                .detail()
                .shippingAddress();
            const customerPhoneNumber = yield this.prisma.client
                .customer({ id: customer.id })
                .detail()
                .phoneNumber();
            const insureShipmentForCustomer = yield this.prisma.client
                .customer({ id: customer.id })
                .detail()
                .insureShipment();
            const customerAddressShippo = Object.assign(Object.assign({}, this.locationDataToShippoAddress(customerShippingAddressPrisma)), { name: `${user.firstName} ${user.lastName}`, phone: customerPhoneNumber, country: "US", email: user.email });
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
                    address_from: customerAddressShippo,
                    address_to: nextCleanersAddressShippo,
                    parcels: [parcel],
                    extra: { is_return: true },
                },
            ];
        });
    }
    createShippingLabel(inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const transaction = yield this.shippo.transaction
                    .create(inputs)
                    .catch(reject);
                if (transaction.object_state === "VALID" &&
                    transaction.status === "ERROR") {
                    return reject(transaction.messages.reduce((acc, curVal) => {
                        return `${acc}. Source: ${curVal.source}. Code: ${curVal.code}. Error Message: ${curVal.text}`;
                    }, ""));
                }
                else if (!transaction.label_url) {
                    return reject(JSON.stringify(transaction));
                }
                return resolve(transaction);
            }));
        });
    }
    locationDataToShippoAddress(location) {
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
    seasonsHQOrCleanersSecondaryAddressFields() {
        return {
            country: "US",
            phone: "706-271-7092",
            email: "reservations@seasons.nyc",
        };
    }
};
ShippingService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [client_service_1.PrismaClientService,
        utils_service_1.UtilsService])
], ShippingService);
exports.ShippingService = ShippingService;
//# sourceMappingURL=shipping.service.js.map