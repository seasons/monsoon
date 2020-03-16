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
const utils_1 = require("../../auth/utils");
const createAuth0User_1 = require("../../auth/createAuth0User");
const getAuth0UserAccessToken_1 = require("../../auth/getAuth0UserAccessToken");
const utils_2 = require("../../utils");
const apollo_server_1 = require("apollo-server");
const createOrUpdateUser_1 = require("../../airtable/createOrUpdateUser");
const request_1 = __importDefault(require("request"));
const push_notifications_server_1 = __importDefault(require("@pusher/push-notifications-server"));
const { PUSHER_INSTANCE_ID, PUSHER_SECRET_KEY } = process.env;
exports.beamsClient = PUSHER_INSTANCE_ID && PUSHER_SECRET_KEY
    ? new push_notifications_server_1.default({
        instanceId: PUSHER_INSTANCE_ID,
        secretKey: PUSHER_SECRET_KEY,
    })
    : null;
exports.auth = {
    beamsData(parent, args, ctx) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = yield utils_1.getUserRequestObject(ctx);
            if (email) {
                const beamsToken = (_a = exports.beamsClient) === null || _a === void 0 ? void 0 : _a.generateToken(email);
                return {
                    beamsToken: beamsToken.token,
                    email,
                };
            }
        });
    },
    // The signup mutation signs up users with a "Customer" role.
    signup(obj, { email, password, firstName, lastName, details }, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            // Register the user on Auth0
            let userAuth0ID;
            try {
                userAuth0ID = yield createAuth0User_1.createAuth0User(email, password, {
                    firstName,
                    lastName,
                });
            }
            catch (err) {
                if (err.message.includes("400")) {
                    throw new apollo_server_1.UserInputError(err);
                }
                throw new Error(err);
            }
            // Get their API access token
            let tokenData;
            try {
                tokenData = yield getAuth0UserAccessToken_1.getAuth0UserAccessToken(email, password);
            }
            catch (err) {
                if (err.message.includes("403")) {
                    throw new apollo_server_1.ForbiddenError(err);
                }
                throw new apollo_server_1.UserInputError(err);
            }
            // Create a user object in our database
            let user;
            try {
                user = yield utils_1.createPrismaUser(ctx, {
                    auth0Id: userAuth0ID,
                    email,
                    firstName,
                    lastName,
                });
            }
            catch (err) {
                throw new Error(err);
            }
            // Create a customer object in our database
            let customer;
            try {
                customer = yield utils_1.createPrismaCustomerForExistingUser(ctx, {
                    userID: user.id,
                    details,
                    status: "Created",
                });
            }
            catch (err) {
                throw new Error(err);
            }
            // Insert them into airtable
            createOrUpdateUser_1.createOrUpdateAirtableUser(user, Object.assign(Object.assign({}, details), { status: "Created" }));
            // Add them to segment and track their account creation event
            const now = new Date();
            ctx.analytics.identify({
                userId: user.id,
                traits: Object.assign(Object.assign({}, extractSegmentReservedTraitsFromCustomerDetail(details)), { firstName: user.firstName, lastName: user.lastName, createdAt: now.toISOString(), id: user.id, role: user.role, email: user.email, auth0Id: user.auth0Id }),
            });
            ctx.analytics.track({
                userId: user.id,
                event: "Created Account",
            });
            return {
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresIn: tokenData.expires_in,
                user,
            };
        });
    },
    login(obj, { email, password }, ctx, info) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // If they are already logged in, throw an error
            if (utils_1.isLoggedIn(ctx)) {
                throw new Error(`user is already logged in`);
            }
            // Get their API access token
            let tokenData;
            try {
                tokenData = yield getAuth0UserAccessToken_1.getAuth0UserAccessToken(email, password);
            }
            catch (err) {
                if (err.message.includes("403")) {
                    throw new apollo_server_1.ForbiddenError(err);
                }
                throw new apollo_server_1.UserInputError(err);
            }
            // Get user with this email
            const user = yield ctx.prisma.user({ email });
            // If the user is a Customer, make sure that the account has been approved
            if (user) {
                if (user.role === "Customer") {
                    const customer = yield utils_2.getCustomerFromUserID(ctx.prisma, user.id);
                    if (customer &&
                        customer.status !== "Active" &&
                        customer.status !== "Authorized") {
                        throw new Error(`User account has not been approved`);
                    }
                }
            }
            else {
                throw new Error("User record not found");
            }
            const beamsToken = (_a = exports.beamsClient) === null || _a === void 0 ? void 0 : _a.generateToken(email);
            return {
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresIn: tokenData.expires_in,
                beamsToken: beamsToken.token,
                user,
            };
        });
    },
    resetPassword(obj, { email }, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                request_1.default({
                    method: "Post",
                    url: `https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password`,
                    headers: { "content-type": "application/json" },
                    body: {
                        client_id: `${process.env.AUTH0_CLIENTID}`,
                        connection: `${process.env.AUTH0_DB_CONNECTION}`,
                        email,
                    },
                    json: true,
                }, (error, response, body) => __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        reject(error);
                    }
                    resolve({ message: body });
                }));
            });
        });
    },
};
function extractSegmentReservedTraitsFromCustomerDetail(detail) {
    let traits = {};
    if (!!detail.phoneNumber) {
        traits["phone"] = detail.phoneNumber;
    }
    return traits;
}
//# sourceMappingURL=auth.js.map