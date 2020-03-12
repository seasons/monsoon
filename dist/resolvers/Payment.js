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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var utils_2 = require("../auth/utils");
var chargebee_1 = __importDefault(require("chargebee"));
var lodash_get_1 = __importDefault(require("lodash.get"));
// Configure chargebee before making API call
chargebee_1.default.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEE_API_KEY,
});
exports.Payment = {
    chargebeeCheckout: function (parent, _a, ctx, info) {
        var planID = _a.planID, userIDHash = _a.userIDHash;
        return __awaiter(void 0, void 0, void 0, function () {
            var allUsers, targetUser, _i, allUsers_1, user, thisUsersIDHash, email, firstName, lastName, correspondingCustomer, phoneNumber, truePlanID, hostedPage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ctx.prisma.users()];
                    case 1:
                        allUsers = _b.sent();
                        for (_i = 0, allUsers_1 = allUsers; _i < allUsers_1.length; _i++) {
                            user = allUsers_1[_i];
                            thisUsersIDHash = utils_1.getUserIDHash(user.id);
                            if (thisUsersIDHash === userIDHash) {
                                targetUser = user;
                            }
                        }
                        if (targetUser === undefined) {
                            throw new Error("no user found for idHash: " + userIDHash);
                        }
                        email = targetUser.email, firstName = targetUser.firstName, lastName = targetUser.lastName;
                        return [4 /*yield*/, utils_1.getCustomerFromUserID(ctx.prisma, targetUser.id)];
                    case 2:
                        correspondingCustomer = _b.sent();
                        return [4 /*yield*/, ctx.prisma
                                .customer({ id: correspondingCustomer.id })
                                .detail()
                            // translate the passed planID into a chargebee-readable version
                        ];
                    case 3:
                        phoneNumber = (_b.sent()).phoneNumber;
                        if (planID === "AllAccess") {
                            truePlanID = "all-access";
                        }
                        else if (planID === "Essential") {
                            truePlanID = "essential";
                        }
                        else {
                            throw new Error("unrecognized planID");
                        }
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                chargebee_1.default.hosted_page
                                    .checkout_new({
                                    subscription: {
                                        plan_id: truePlanID,
                                    },
                                    customer: {
                                        id: targetUser.id,
                                        email: email,
                                        first_name: firstName,
                                        last_name: lastName,
                                        phone: phoneNumber,
                                    },
                                })
                                    .request(function (error, result) {
                                    if (error) {
                                        reject(error);
                                    }
                                    else {
                                        resolve(result.hosted_page);
                                    }
                                });
                            }).catch(function (error) {
                                throw new Error(JSON.stringify(error));
                            })
                            // Track the selection
                        ];
                    case 4:
                        hostedPage = _b.sent();
                        // Track the selection
                        ctx.analytics.track({
                            userId: targetUser.id,
                            event: "Opened Checkout",
                            properties: {
                                plan: planID,
                            },
                        });
                        return [2 /*return*/, hostedPage];
                }
            });
        });
    },
    chargebeeUpdatePaymentPage: function (parent, _a, ctx, info) { return __awaiter(void 0, void 0, void 0, function () {
        var user, customer, hostedPage;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, utils_2.getUserFromContext(ctx)];
                case 1:
                    user = _b.sent();
                    if (!user) {
                        throw new Error("No user found.");
                    }
                    return [4 /*yield*/, utils_2.getCustomerFromContext(ctx)];
                case 2:
                    customer = _b.sent();
                    if (!customer) {
                        throw new Error("User is not a customer.");
                    }
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            chargebee_1.default.hosted_page
                                .manage_payment_sources({
                                customer: {
                                    id: user.id,
                                }
                            })
                                .request(function (error, result) {
                                if (error) {
                                    reject(error);
                                }
                                else {
                                    resolve(result.hosted_page);
                                }
                            });
                        }).catch(function (error) {
                            throw new Error(JSON.stringify(error));
                        })];
                case 3:
                    hostedPage = _b.sent();
                    return [2 /*return*/, hostedPage];
            }
        });
    }); },
};
exports.updateChargebeeBillingAddress = function (userID, billingStreet1, billingStreet2, billingCity, billingState, billingPostalCode) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                    chargebee_1.default.customer.update_billing_info(userID, {
                        billing_address: {
                            line1: billingStreet1,
                            line2: billingStreet2,
                            city: billingCity,
                            state: billingState,
                            zip: billingPostalCode,
                        }
                    }).request(function (error, result) {
                        if (error) {
                            reject(JSON.stringify(error));
                        }
                        else {
                            var chargebeeBillingAddress = lodash_get_1.default(result, "customer.billing_address");
                            if (!chargebeeBillingAddress) {
                                reject("Failed to update billing address on chargebee.");
                            }
                            resolve(chargebeeBillingAddress);
                        }
                    });
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.getChargebeePaymentSource = function (userID) { return __awaiter(void 0, void 0, void 0, function () {
    var cardInfo;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                    // Get user's payment information from chargebee		
                    chargebee_1.default.payment_source.list({
                        limit: 1,
                        "customer_id[is]": userID,
                        "type[is]": "card"
                    }).request(function (error, result) {
                        if (error) {
                            reject(error);
                        }
                        else {
                            var card = lodash_get_1.default(result, "list[0].payment_source.card");
                            if (!card) {
                                reject("No card found for customer.");
                            }
                            resolve(card);
                        }
                    });
                }).catch(function (error) {
                    throw new Error(JSON.stringify(error));
                })];
            case 1:
                cardInfo = _a.sent();
                return [2 /*return*/, cardInfo];
        }
    });
}); };
//# sourceMappingURL=Payment.js.map