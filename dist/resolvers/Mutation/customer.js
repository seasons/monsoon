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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_server_1 = require("apollo-server");
var chargebee_1 = __importDefault(require("chargebee"));
var mail_1 = __importDefault(require("@sendgrid/mail"));
var zipcodes_1 = __importDefault(require("zipcodes"));
var address_1 = require("./address");
var createOrUpdateUser_1 = require("../../airtable/createOrUpdateUser");
var utils_1 = require("../../auth/utils");
var emails_1 = require("../../emails");
var Payment_1 = require("../Payment");
var sendTransactionalEmail_1 = require("../../sendTransactionalEmail");
var utils_2 = require("../../utils");
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
chargebee_1.default.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEE_API_KEY,
});
exports.customer = {
    addCustomerDetails: function (obj, _a, ctx, info) {
        var details = _a.details, event = _a.event, status = _a.status;
        return __awaiter(this, void 0, void 0, function () {
            var user, customer, currentCustomerDetail, eventNameMap, returnData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // They should not have included any "id" in the input
                        if (details.id != null) {
                            throw new apollo_server_1.UserInputError("payload should not include id");
                        }
                        return [4 /*yield*/, utils_1.getUserFromContext(ctx)];
                    case 1:
                        user = _b.sent();
                        return [4 /*yield*/, utils_1.getCustomerFromContext(ctx)
                            // Add the details. If necessary, create the details object afresh.
                        ];
                    case 2:
                        customer = _b.sent();
                        return [4 /*yield*/, ctx.prisma
                                .customer({ id: customer.id })
                                .detail()];
                    case 3:
                        currentCustomerDetail = _b.sent();
                        if (!(currentCustomerDetail == null)) return [3 /*break*/, 5];
                        return [4 /*yield*/, ctx.prisma.updateCustomer({
                                data: { detail: { create: details } },
                                where: { id: customer.id },
                            })];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, ctx.prisma.updateCustomerDetail({
                            data: details,
                            where: { id: currentCustomerDetail.id },
                        })];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        if (!!!status) return [3 /*break*/, 9];
                        return [4 /*yield*/, utils_2.setCustomerPrismaStatus(ctx.prisma, user, status)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9: 
                    // Sync with airtable
                    return [4 /*yield*/, createOrUpdateUser_1.createOrUpdateAirtableUser(user, __assign(__assign(__assign({}, currentCustomerDetail), details), { status: status }))
                        // Track the event, if its been passed
                    ];
                    case 10:
                        // Sync with airtable
                        _b.sent();
                        eventNameMap = { CompletedWaitlistForm: "Completed Waitlist Form" };
                        if (!!event) {
                            ctx.analytics.track({
                                userId: user.id,
                                event: eventNameMap[event],
                            });
                        }
                        return [4 /*yield*/, ctx.db.query.customer({ where: { id: customer.id } }, info)];
                    case 11:
                        returnData = _b.sent();
                        return [2 /*return*/, returnData];
                }
            });
        });
    },
    updatePaymentAndShipping: function (obj, _a, ctx, info) {
        var billingAddress = _a.billingAddress, phoneNumber = _a.phoneNumber, shippingAddress = _a.shippingAddress;
        return __awaiter(this, void 0, void 0, function () {
            var user, customer, billingCity, billingPostalCode, billingState, billingStreet1, billingStreet2, billingAddressIsValid;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, utils_1.getUserFromContext(ctx)];
                    case 1:
                        user = _b.sent();
                        return [4 /*yield*/, utils_1.getCustomerFromContext(ctx)];
                    case 2:
                        customer = _b.sent();
                        billingCity = billingAddress.city, billingPostalCode = billingAddress.postalCode, billingState = billingAddress.state, billingStreet1 = billingAddress.street1, billingStreet2 = billingAddress.street2;
                        return [4 /*yield*/, address_1.shippoValidateAddress({
                                name: user.firstName,
                                street1: billingStreet1,
                                city: billingCity,
                                state: billingState,
                                zip: billingPostalCode
                            })];
                    case 3:
                        billingAddressIsValid = (_b.sent()).isValid;
                        if (!billingAddressIsValid) {
                            throw new Error("Billing address is invalid");
                        }
                        // Update user's billing address on chargebee
                        return [4 /*yield*/, Payment_1.updateChargebeeBillingAddress(user.id, billingStreet1, billingStreet2, billingCity, billingState, billingPostalCode)
                            // Update customer's billing address
                        ];
                    case 4:
                        // Update user's billing address on chargebee
                        _b.sent();
                        // Update customer's billing address
                        return [4 /*yield*/, updateCustomerBillingAddress(ctx, user.id, customer.id, billingStreet1, billingStreet2, billingCity, billingState, billingPostalCode)
                            // Update customer's shipping address & phone number. Will throw an
                            // error if the address is not in NYC
                        ];
                    case 5:
                        // Update customer's billing address
                        _b.sent();
                        // Update customer's shipping address & phone number. Will throw an
                        // error if the address is not in NYC
                        return [4 /*yield*/, updateCustomerDetail(ctx, user, customer, shippingAddress, phoneNumber)];
                    case 6:
                        // Update customer's shipping address & phone number. Will throw an
                        // error if the address is not in NYC
                        _b.sent();
                        return [2 /*return*/, null];
                }
            });
        });
    },
    acknowledgeCompletedChargebeeHostedCheckout: function (obj, _a, ctx, info) {
        var hostedPageID = _a.hostedPageID;
        return __awaiter(this, void 0, void 0, function () {
            var prismaCustomer, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, chargebee_1.default.hosted_page
                                .acknowledge(hostedPageID)
                                .request(function (error, result) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var _a, subscription, card, chargebeeCustomer, plan, billingInfo, prismaUser;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                if (!error) return [3 /*break*/, 1];
                                                throw error;
                                            case 1:
                                                _a = result.hosted_page.content, subscription = _a.subscription, card = _a.card, chargebeeCustomer = _a.customer;
                                                plan = { essential: "Essential", "all-access": "AllAccess" }[subscription.plan_id];
                                                if (!plan) {
                                                    throw new Error("unexpected plan-id: " + subscription.plan_id);
                                                }
                                                billingInfo = createBillingInfoObject(card, chargebeeCustomer);
                                                return [4 /*yield*/, ctx.prisma.user({
                                                        id: subscription.customer_id,
                                                    })];
                                            case 2:
                                                prismaUser = _b.sent();
                                                return [4 /*yield*/, utils_2.getCustomerFromUserID(ctx.prisma, prismaUser.id)];
                                            case 3:
                                                prismaCustomer = _b.sent();
                                                return [4 /*yield*/, ctx.prisma.updateCustomer({
                                                        data: {
                                                            plan: plan,
                                                            billingInfo: {
                                                                create: billingInfo,
                                                            },
                                                            status: "Active",
                                                        },
                                                        where: { id: prismaCustomer.id },
                                                    })
                                                    // Save it to airtable
                                                ];
                                            case 4:
                                                _b.sent();
                                                // Save it to airtable
                                                return [4 /*yield*/, createOrUpdateUser_1.createOrUpdateAirtableUser(prismaUser, {
                                                        status: "Active",
                                                        plan: plan,
                                                        billingInfo: billingInfo,
                                                    })
                                                    // Send welcome to seasons email
                                                ];
                                            case 5:
                                                // Save it to airtable
                                                _b.sent();
                                                // Send welcome to seasons email
                                                sendWelcomeToSeasonsEmail(prismaUser);
                                                // Track the event
                                                ctx.analytics.track({
                                                    userId: prismaUser.id,
                                                    event: "Subscribed",
                                                    properties: {
                                                        plan: plan,
                                                    },
                                                });
                                                // Return
                                                return [2 /*return*/, {
                                                        billingInfo: ctx.prisma
                                                            .customer({ id: prismaCustomer.id })
                                                            .billingInfo(),
                                                        plan: ctx.prisma.customer({ id: prismaCustomer.id }).plan(),
                                                    }];
                                        }
                                    });
                                });
                            })];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _b.sent();
                        throw err_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
};
function sendWelcomeToSeasonsEmail(user) {
    sendTransactionalEmail_1.sendTransactionalEmail({
        to: user.email,
        data: emails_1.emails.welcomeToSeasonsData(user.firstName),
    });
}
function getNameFromCard(card) {
    return "" + (!!card.first_name ? card.first_name : "") + (!!card.last_name ? " " + card.last_name : "");
}
function createBillingInfoObject(card, chargebeeCustomer) {
    return {
        brand: card.card_type,
        name: getNameFromCard(card),
        last_digits: card.last4,
        expiration_month: card.expiry_month,
        expiration_year: card.expiry_year,
        street1: chargebeeCustomer.billing_address.line1,
        street2: chargebeeCustomer.billing_address.line2,
        city: chargebeeCustomer.billing_address.city,
        state: chargebeeCustomer.billing_address.state,
        country: chargebeeCustomer.billing_address.country,
        postal_code: chargebeeCustomer.billing_address.zip,
    };
}
function updateCustomerDetail(ctx, user, customer, shippingAddress, phoneNumber) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var shippingCity, shippingPostalCode, shippingState, shippingStreet1, shippingStreet2, shippingAddressIsValid, zipcodesData, validCities, detailID, shippingAddressData, shippingAddressID, shippingAddress_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    shippingCity = shippingAddress.city, shippingPostalCode = shippingAddress.postalCode, shippingState = shippingAddress.state, shippingStreet1 = shippingAddress.street1, shippingStreet2 = shippingAddress.street2;
                    return [4 /*yield*/, address_1.shippoValidateAddress({
                            name: user.firstName,
                            street1: shippingStreet1,
                            city: shippingCity,
                            state: shippingState,
                            zip: shippingPostalCode
                        })];
                case 1:
                    shippingAddressIsValid = (_c.sent()).isValid;
                    if (!shippingAddressIsValid) {
                        throw new Error("Shipping address is invalid");
                    }
                    zipcodesData = zipcodes_1.default.lookup(parseInt(shippingPostalCode));
                    validCities = ["Brooklyn", "New York", "Queens", "The Bronx"];
                    if (((_a = zipcodesData) === null || _a === void 0 ? void 0 : _a.state) !== "NY" || !validCities.includes((_b = zipcodesData) === null || _b === void 0 ? void 0 : _b.city)) {
                        throw new Error("SHIPPING_ADDRESS_NOT_NYC");
                    }
                    return [4 /*yield*/, ctx.prisma.customer({ id: customer.id })
                            .detail()
                            .id()];
                case 2:
                    detailID = _c.sent();
                    shippingAddressData = {
                        slug: user.firstName + "-" + user.lastName + "-shipping-address",
                        name: user.firstName + " " + user.lastName,
                        city: shippingCity,
                        zipCode: shippingPostalCode,
                        state: shippingState,
                        address1: shippingStreet1,
                        address2: shippingStreet2,
                    };
                    if (!detailID) return [3 /*break*/, 7];
                    return [4 /*yield*/, ctx.prisma.customer({ id: customer.id })
                            .detail()
                            .shippingAddress()
                            .id()];
                case 3:
                    shippingAddressID = _c.sent();
                    return [4 /*yield*/, ctx.prisma.upsertLocation({
                            create: shippingAddressData,
                            update: shippingAddressData,
                            where: { id: shippingAddressID }
                        })];
                case 4:
                    shippingAddress_1 = _c.sent();
                    if (!shippingAddress_1) return [3 /*break*/, 6];
                    return [4 /*yield*/, ctx.prisma.updateCustomerDetail({
                            data: {
                                phoneNumber: phoneNumber,
                                shippingAddress: { connect: { id: shippingAddress_1.id } }
                            },
                            where: { id: detailID }
                        })];
                case 5:
                    _c.sent();
                    _c.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, ctx.prisma.updateCustomer({
                        data: {
                            detail: {
                                create: {
                                    phoneNumber: phoneNumber,
                                    shippingAddress: {
                                        create: shippingAddressData
                                    }
                                }
                            }
                        },
                        where: { id: customer.id }
                    })];
                case 8:
                    _c.sent();
                    _c.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    });
}
function updateCustomerBillingAddress(ctx, userID, customerID, billingStreet1, billingStreet2, billingCity, billingState, billingPostalCode) {
    return __awaiter(this, void 0, void 0, function () {
        var billingAddressData, billingInfoId, cardInfo, brand, expiry_month, expiry_year, first_name, last4, last_name, billingInfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    billingAddressData = {
                        city: billingCity,
                        postal_code: billingPostalCode,
                        state: billingState,
                        street1: billingStreet1,
                        street2: billingStreet2
                    };
                    return [4 /*yield*/, ctx.prisma.customer({ id: customerID })
                            .billingInfo()
                            .id()];
                case 1:
                    billingInfoId = _a.sent();
                    if (!billingInfoId) return [3 /*break*/, 3];
                    return [4 /*yield*/, ctx.prisma.updateBillingInfo({
                            data: billingAddressData,
                            where: { id: billingInfoId }
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 3: return [4 /*yield*/, Payment_1.getChargebeePaymentSource(userID)];
                case 4:
                    cardInfo = _a.sent();
                    brand = cardInfo.brand, expiry_month = cardInfo.expiry_month, expiry_year = cardInfo.expiry_year, first_name = cardInfo.first_name, last4 = cardInfo.last4, last_name = cardInfo.last_name;
                    return [4 /*yield*/, ctx.prisma.createBillingInfo(__assign(__assign({}, billingAddressData), { brand: brand, expiration_month: expiry_month, expiration_year: expiry_year, last_digits: last4, name: first_name + " " + last_name }))
                        // Connect new billing info to customer object
                    ];
                case 5:
                    billingInfo = _a.sent();
                    // Connect new billing info to customer object
                    return [4 /*yield*/, ctx.prisma.updateCustomer({
                            data: { billingInfo: { connect: { id: billingInfo.id } } },
                            where: { id: customerID }
                        })];
                case 6:
                    // Connect new billing info to customer object
                    _a.sent();
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=customer.js.map