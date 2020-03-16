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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const utils_2 = require("../auth/utils");
const chargebee_1 = __importDefault(require("chargebee"));
const lodash_get_1 = __importDefault(require("lodash.get"));
// Configure chargebee before making API call
chargebee_1.default.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEE_API_KEY,
});
exports.Payment = {
    chargebeeCheckout: (parent, { planID, userIDHash }, ctx, info) => __awaiter(void 0, void 0, void 0, function* () {
        // Is there a user in the db that corresponds to the given userIDHash?
        const allUsers = yield ctx.prisma.users();
        let targetUser;
        for (const user of allUsers) {
            let thisUsersIDHash = utils_1.getUserIDHash(user.id);
            if (thisUsersIDHash === userIDHash) {
                targetUser = user;
            }
        }
        if (targetUser === undefined) {
            throw new Error(`no user found for idHash: ${userIDHash}`);
        }
        // Get email, firstName, lastName, phoneNumber of targetUser
        const { email, firstName, lastName } = targetUser;
        const correspondingCustomer = yield utils_1.getCustomerFromUserID(ctx.prisma, targetUser.id);
        const { phoneNumber } = yield ctx.prisma
            .customer({ id: correspondingCustomer.id })
            .detail();
        // translate the passed planID into a chargebee-readable version
        let truePlanID;
        if (planID === "AllAccess") {
            truePlanID = "all-access";
        }
        else if (planID === "Essential") {
            truePlanID = "essential";
        }
        else {
            throw new Error("unrecognized planID");
        }
        const hostedPage = yield new Promise((resolve, reject) => {
            chargebee_1.default.hosted_page
                .checkout_new({
                subscription: {
                    plan_id: truePlanID,
                },
                customer: {
                    id: targetUser.id,
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    phone: phoneNumber,
                },
            })
                .request((error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result.hosted_page);
                }
            });
        }).catch(error => {
            throw new Error(JSON.stringify(error));
        });
        // Track the selection
        ctx.analytics.track({
            userId: targetUser.id,
            event: "Opened Checkout",
            properties: {
                plan: planID,
            },
        });
        return hostedPage;
    }),
    chargebeeUpdatePaymentPage: (parent, {}, ctx, info) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield utils_2.getUserFromContext(ctx);
        if (!user) {
            throw new Error("No user found.");
        }
        const customer = yield utils_2.getCustomerFromContext(ctx);
        if (!customer) {
            throw new Error("User is not a customer.");
        }
        const hostedPage = yield new Promise((resolve, reject) => {
            chargebee_1.default.hosted_page
                .manage_payment_sources({
                customer: {
                    id: user.id,
                }
            })
                .request((error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result.hosted_page);
                }
            });
        }).catch(error => {
            throw new Error(JSON.stringify(error));
        });
        return hostedPage;
    }),
};
exports.updateChargebeeBillingAddress = (userID, billingStreet1, billingStreet2, billingCity, billingState, billingPostalCode) => __awaiter(void 0, void 0, void 0, function* () {
    yield new Promise((resolve, reject) => {
        chargebee_1.default.customer.update_billing_info(userID, {
            billing_address: {
                line1: billingStreet1,
                line2: billingStreet2,
                city: billingCity,
                state: billingState,
                zip: billingPostalCode,
            }
        }).request((error, result) => {
            if (error) {
                reject(JSON.stringify(error));
            }
            else {
                const chargebeeBillingAddress = lodash_get_1.default(result, "customer.billing_address");
                if (!chargebeeBillingAddress) {
                    reject("Failed to update billing address on chargebee.");
                }
                resolve(chargebeeBillingAddress);
            }
        });
    });
});
exports.getChargebeePaymentSource = (userID) => __awaiter(void 0, void 0, void 0, function* () {
    const cardInfo = yield new Promise((resolve, reject) => {
        // Get user's payment information from chargebee		
        chargebee_1.default.payment_source.list({
            limit: 1,
            "customer_id[is]": userID,
            "type[is]": "card"
        }).request((error, result) => {
            if (error) {
                reject(error);
            }
            else {
                const card = lodash_get_1.default(result, "list[0].payment_source.card");
                if (!card) {
                    reject("No card found for customer.");
                }
                resolve(card);
            }
        });
    }).catch(error => {
        throw new Error(JSON.stringify(error));
    });
    return cardInfo;
});
//# sourceMappingURL=Payment.js.map