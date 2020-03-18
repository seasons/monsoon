"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../../utils");
function createShippoShipment(prisma, user, customer, shipmentWeight, insuranceAmount) {
    return __awaiter(this, void 0, void 0, function () {
        function seasonsHQOrCleanersSecondaryAddressFields() {
            return {
                country: "US",
                phone: "706-271-7092",
                email: "reservations@seasons.nyc",
            };
        }
        var nextCleanersAddressPrisma, nextCleanersAddressShippo, customerShippingAddressPrisma, customerPhoneNumber, insureShipmentForCustomer, customerAddressShippo, parcel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, utils_1.getPrismaLocationFromSlug(prisma, process.env.SEASONS_CLEANER_LOCATION_SLUG)];
                case 1:
                    nextCleanersAddressPrisma = _a.sent();
                    nextCleanersAddressShippo = __assign(__assign({}, locationDataToShippoAddress(nextCleanersAddressPrisma)), seasonsHQOrCleanersSecondaryAddressFields());
                    return [4 /*yield*/, prisma
                            .customer({ id: customer.id })
                            .detail()
                            .shippingAddress()];
                case 2:
                    customerShippingAddressPrisma = _a.sent();
                    return [4 /*yield*/, prisma
                            .customer({ id: customer.id })
                            .detail()
                            .phoneNumber()];
                case 3:
                    customerPhoneNumber = _a.sent();
                    return [4 /*yield*/, prisma
                            .customer({ id: customer.id })
                            .detail()
                            .insureShipment()];
                case 4:
                    insureShipmentForCustomer = _a.sent();
                    customerAddressShippo = __assign(__assign({}, locationDataToShippoAddress(customerShippingAddressPrisma)), { name: user.firstName + " " + user.lastName, phone: customerPhoneNumber, country: "US", email: user.email });
                    parcel = {
                        // dimensions of seasons bag
                        length: "20",
                        width: "28",
                        height: "5",
                        distance_unit: "in",
                        weight: shipmentWeight,
                        mass_unit: "lb",
                    };
                    return [2 /*return*/, [
                            __assign({ address_from: nextCleanersAddressShippo, address_to: customerAddressShippo, parcels: [parcel] }, (insureShipmentForCustomer && {
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
                        ]];
            }
        });
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