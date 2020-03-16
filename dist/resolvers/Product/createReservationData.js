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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_server_1 = require("apollo-server");
function createReservationData(prisma, seasonsToCustomerTransaction, customerToSeasonsTransaction, user, customer, shipmentWeight, physicalProductsBeingReserved, heldPhysicalProducts) {
    return __awaiter(this, void 0, void 0, function () {
        var allPhysicalProductsInReservation, physicalProductSUIDs, customerShippingAddressRecordID, uniqueReservationNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allPhysicalProductsInReservation = __spreadArrays(physicalProductsBeingReserved, heldPhysicalProducts);
                    if (allPhysicalProductsInReservation.length > 3) {
                        throw new apollo_server_1.ApolloError("Can not reserve more than 3 items at a time");
                    }
                    physicalProductSUIDs = allPhysicalProductsInReservation.map(function (p) { return ({
                        seasonsUID: p.seasonsUID,
                    }); });
                    return [4 /*yield*/, prisma
                            .customer({ id: customer.id })
                            .detail()
                            .shippingAddress()
                            .id()];
                case 1:
                    customerShippingAddressRecordID = _a.sent();
                    return [4 /*yield*/, getUniqueReservationNumber(prisma)];
                case 2:
                    uniqueReservationNumber = _a.sent();
                    return [2 /*return*/, {
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
                                        connect: physicalProductsBeingReserved.map(function (prod) {
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
                        }];
            }
        });
    });
}
exports.createReservationData = createReservationData;
function getUniqueReservationNumber(prisma) {
    return __awaiter(this, void 0, void 0, function () {
        var reservationNumber, foundUnique, reservationWithThatNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    foundUnique = false;
                    _a.label = 1;
                case 1:
                    if (!!foundUnique) return [3 /*break*/, 3];
                    reservationNumber = Math.floor(Math.random() * 900000000) + 100000000;
                    return [4 /*yield*/, prisma.reservation({
                            reservationNumber: reservationNumber,
                        })];
                case 2:
                    reservationWithThatNumber = _a.sent();
                    foundUnique = !reservationWithThatNumber;
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, reservationNumber];
            }
        });
    });
}
//# sourceMappingURL=createReservationData.js.map