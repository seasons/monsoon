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
const apollo_server_1 = require("apollo-server");
const chargebee_1 = __importDefault(require("chargebee"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const zipcodes_1 = __importDefault(require("zipcodes"));
const address_1 = require("./address");
const createOrUpdateUser_1 = require("../../airtable/createOrUpdateUser");
const utils_1 = require("../../auth/utils");
const emails_1 = require("../../emails");
const Payment_1 = require("../Payment");
const sendTransactionalEmail_1 = require("../../sendTransactionalEmail");
const utils_2 = require("../../utils");
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
chargebee_1.default.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEE_API_KEY,
});
exports.customer = {
    addCustomerDetails(obj, { details, event, status }, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            // They should not have included any "id" in the input
            if (details.id != null) {
                throw new apollo_server_1.UserInputError("payload should not include id");
            }
            // Grab the customer off the context
            const user = yield utils_1.getUserFromContext(ctx);
            const customer = yield utils_1.getCustomerFromContext(ctx);
            // Add the details. If necessary, create the details object afresh.
            const currentCustomerDetail = yield ctx.prisma
                .customer({ id: customer.id })
                .detail();
            if (currentCustomerDetail == null) {
                yield ctx.prisma.updateCustomer({
                    data: { detail: { create: details } },
                    where: { id: customer.id },
                });
            }
            else {
                yield ctx.prisma.updateCustomerDetail({
                    data: details,
                    where: { id: currentCustomerDetail.id },
                });
            }
            // If a status was passed, update the customer status in prisma
            if (!!status) {
                yield utils_2.setCustomerPrismaStatus(ctx.prisma, user, status);
            }
            // Sync with airtable
            yield createOrUpdateUser_1.createOrUpdateAirtableUser(user, Object.assign(Object.assign(Object.assign({}, currentCustomerDetail), details), { status }));
            // Track the event, if its been passed
            const eventNameMap = { CompletedWaitlistForm: "Completed Waitlist Form" };
            if (!!event) {
                ctx.analytics.track({
                    userId: user.id,
                    event: eventNameMap[event],
                });
            }
            // Return the updated customer object
            const returnData = yield ctx.db.query.customer({ where: { id: customer.id } }, info);
            return returnData;
        });
    },
    updatePaymentAndShipping(obj, { billingAddress, phoneNumber, shippingAddress }, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield utils_1.getUserFromContext(ctx);
            const customer = yield utils_1.getCustomerFromContext(ctx);
            const { city: billingCity, postalCode: billingPostalCode, state: billingState, street1: billingStreet1, street2: billingStreet2 } = billingAddress;
            const { isValid: billingAddressIsValid } = yield address_1.shippoValidateAddress({
                name: user.firstName,
                street1: billingStreet1,
                city: billingCity,
                state: billingState,
                zip: billingPostalCode
            });
            if (!billingAddressIsValid) {
                throw new Error("Billing address is invalid");
            }
            // Update user's billing address on chargebee
            yield Payment_1.updateChargebeeBillingAddress(user.id, billingStreet1, billingStreet2, billingCity, billingState, billingPostalCode);
            // Update customer's billing address
            yield updateCustomerBillingAddress(ctx, user.id, customer.id, billingStreet1, billingStreet2, billingCity, billingState, billingPostalCode);
            // Update customer's shipping address & phone number. Will throw an
            // error if the address is not in NYC
            yield updateCustomerDetail(ctx, user, customer, shippingAddress, phoneNumber);
            return null;
        });
    },
    acknowledgeCompletedChargebeeHostedCheckout(obj, { hostedPageID }, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            let prismaCustomer;
            try {
                yield chargebee_1.default.hosted_page
                    .acknowledge(hostedPageID)
                    .request(function (error, result) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (error) {
                            throw error;
                        }
                        else {
                            var { subscription, card, customer: chargebeeCustomer, } = result.hosted_page.content;
                            // Retrieve plan and billing data
                            let plan = { essential: "Essential", "all-access": "AllAccess" }[subscription.plan_id];
                            if (!plan) {
                                throw new Error(`unexpected plan-id: ${subscription.plan_id}`);
                            }
                            let billingInfo = createBillingInfoObject(card, chargebeeCustomer);
                            // Save it to prisma
                            let prismaUser = yield ctx.prisma.user({
                                id: subscription.customer_id,
                            });
                            prismaCustomer = yield utils_2.getCustomerFromUserID(ctx.prisma, prismaUser.id);
                            yield ctx.prisma.updateCustomer({
                                data: {
                                    plan: plan,
                                    billingInfo: {
                                        create: billingInfo,
                                    },
                                    status: "Active",
                                },
                                where: { id: prismaCustomer.id },
                            });
                            // Save it to airtable
                            yield createOrUpdateUser_1.createOrUpdateAirtableUser(prismaUser, {
                                status: "Active",
                                plan,
                                billingInfo,
                            });
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
                            return {
                                billingInfo: ctx.prisma
                                    .customer({ id: prismaCustomer.id })
                                    .billingInfo(),
                                plan: ctx.prisma.customer({ id: prismaCustomer.id }).plan(),
                            };
                        }
                    });
                });
            }
            catch (err) {
                throw err;
            }
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
    return `${!!card.first_name ? card.first_name : ""}${!!card.last_name ? " " + card.last_name : ""}`;
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
    return __awaiter(this, void 0, void 0, function* () {
        const { city: shippingCity, postalCode: shippingPostalCode, state: shippingState, street1: shippingStreet1, street2: shippingStreet2 } = shippingAddress;
        const { isValid: shippingAddressIsValid } = yield address_1.shippoValidateAddress({
            name: user.firstName,
            street1: shippingStreet1,
            city: shippingCity,
            state: shippingState,
            zip: shippingPostalCode
        });
        if (!shippingAddressIsValid) {
            throw new Error("Shipping address is invalid");
        }
        const zipcodesData = zipcodes_1.default.lookup(parseInt(shippingPostalCode));
        const validCities = ["Brooklyn", "New York", "Queens", "The Bronx"];
        if (((_a = zipcodesData) === null || _a === void 0 ? void 0 : _a.state) !== "NY" || !validCities.includes((_b = zipcodesData) === null || _b === void 0 ? void 0 : _b.city)) {
            throw new Error("SHIPPING_ADDRESS_NOT_NYC");
        }
        // Update the user's shipping address
        const detailID = yield ctx.prisma.customer({ id: customer.id })
            .detail()
            .id();
        const shippingAddressData = {
            slug: `${user.firstName}-${user.lastName}-shipping-address`,
            name: `${user.firstName} ${user.lastName}`,
            city: shippingCity,
            zipCode: shippingPostalCode,
            state: shippingState,
            address1: shippingStreet1,
            address2: shippingStreet2,
        };
        if (detailID) {
            const shippingAddressID = yield ctx.prisma.customer({ id: customer.id })
                .detail()
                .shippingAddress()
                .id();
            const shippingAddress = yield ctx.prisma.upsertLocation({
                create: shippingAddressData,
                update: shippingAddressData,
                where: { id: shippingAddressID }
            });
            if (shippingAddress) {
                yield ctx.prisma.updateCustomerDetail({
                    data: {
                        phoneNumber,
                        shippingAddress: { connect: { id: shippingAddress.id } }
                    },
                    where: { id: detailID }
                });
            }
        }
        else {
            yield ctx.prisma.updateCustomer({
                data: {
                    detail: {
                        create: {
                            phoneNumber,
                            shippingAddress: {
                                create: shippingAddressData
                            }
                        }
                    }
                },
                where: { id: customer.id }
            });
        }
    });
}
function updateCustomerBillingAddress(ctx, userID, customerID, billingStreet1, billingStreet2, billingCity, billingState, billingPostalCode) {
    return __awaiter(this, void 0, void 0, function* () {
        const billingAddressData = {
            city: billingCity,
            postal_code: billingPostalCode,
            state: billingState,
            street1: billingStreet1,
            street2: billingStreet2
        };
        const billingInfoId = yield ctx.prisma.customer({ id: customerID })
            .billingInfo()
            .id();
        if (billingInfoId) {
            yield ctx.prisma.updateBillingInfo({
                data: billingAddressData,
                where: { id: billingInfoId }
            });
        }
        else {
            // Get user's card information from chargebee
            const cardInfo = yield Payment_1.getChargebeePaymentSource(userID);
            const { brand, expiry_month, expiry_year, first_name, last4, last_name } = cardInfo;
            // Create new billing info object
            const billingInfo = yield ctx.prisma.createBillingInfo(Object.assign(Object.assign({}, billingAddressData), { brand, expiration_month: expiry_month, expiration_year: expiry_year, last_digits: last4, name: `${first_name} ${last_name}` }));
            // Connect new billing info to customer object
            yield ctx.prisma.updateCustomer({
                data: { billingInfo: { connect: { id: billingInfo.id } } },
                where: { id: customerID }
            });
        }
    });
}
//# sourceMappingURL=customer.js.map