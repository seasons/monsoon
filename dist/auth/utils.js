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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = __importStar(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const get_1 = __importDefault(require("lodash/get"));
const head_1 = __importDefault(require("lodash/head"));
exports.PW_STRENGTH_RULES_URL = "https://manage.auth0.com/dashboard/us/seasons/connections/database/con_btTULQOf6kAxxbCz/security";
const jwks = jwks_rsa_1.default({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 1,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});
function validateAndParseIdToken(idToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const { header, payload } = jwt.decode(idToken, { complete: true });
            if (!header || !header.kid || !payload)
                reject(new Error("Invalid Token"));
            jwks.getSigningKey(header.kid, (err, key) => {
                if (err)
                    reject(new Error("Error getting signing key: " + err.message));
                jwt.verify(idToken, key.publicKey, { algorithms: ["RS256"] }, (err, decoded) => {
                    if (err)
                        reject("jwt verify error: " + err.message);
                    resolve(decoded);
                });
            });
        });
    });
}
exports.validateAndParseIdToken = validateAndParseIdToken;
// retrieves the user indicated by the JWT token on the request.
// If no such user exists, throws an error.
function getUserFromContext(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function getCustomerFromToken(resolve, reject) {
            var _a, _b, _c;
            return __awaiter(this, void 0, void 0, function* () {
                if (!ctx.req.user) {
                    return reject("no user on context");
                }
                let userExists = false;
                // Does such a user exist?
                const auth0Id = (_c = (_b = (_a = ctx.req) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.sub) === null || _c === void 0 ? void 0 : _c.split("|")[1]; // e.g "auth0|5da61ffdeef18b0c5f5c2c6f"
                try {
                    userExists = yield ctx.prisma.$exists.user({ auth0Id });
                }
                catch (err) {
                    console.log(err);
                }
                if (!userExists) {
                    reject(`token does not correspond to any known user. User Auth0ID: ${auth0Id}`);
                }
                // User exists. Let's return
                let user = yield ctx.prisma.user({ auth0Id });
                resolve(user);
            });
        });
    });
}
exports.getUserFromContext = getUserFromContext;
function getCustomerFromContext(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the user on the context
        const user = yield getUserFromContext(ctx); // will throw error if user doesn't exist
        if (user.role !== "Customer") {
            throw new Error(`token belongs to a user of type ${user.role}, not Customer`);
        }
        // Get the customer record corresponding to that user
        return head_1.default(yield ctx.prisma.customers({
            where: { user: { id: user.id } },
        }));
    });
}
exports.getCustomerFromContext = getCustomerFromContext;
function getUserRequestObject(ctx) {
    const user = ctx.req.user;
    if (user) {
        return user;
    }
    throw new AuthError();
}
exports.getUserRequestObject = getUserRequestObject;
function createPrismaUser(ctx, { auth0Id, email, firstName, lastName }) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield ctx.prisma.createUser({
            auth0Id,
            email,
            firstName,
            lastName,
        });
        return user;
    });
}
exports.createPrismaUser = createPrismaUser;
function createPrismaCustomerForExistingUser(ctx, { userID, details = {}, status }) {
    return __awaiter(this, void 0, void 0, function* () {
        const customer = yield ctx.prisma.createCustomer({
            user: {
                connect: { id: userID },
            },
            detail: { create: details },
            status: status || "Waitlisted",
        });
        // TODO: update airtable with customer data
        return customer;
    });
}
exports.createPrismaCustomerForExistingUser = createPrismaCustomerForExistingUser;
class AuthError extends Error {
    constructor() {
        super("Not authorized");
    }
}
exports.AuthError = AuthError;
exports.isLoggedIn = ctx => {
    return !!get_1.default(ctx, "req.user");
};
exports.getUserIfExists = ctx => {
    const user = get_1.default(ctx, "req.user");
    if (!user)
        throw new Error(`Not logged in`);
    return user;
};
//# sourceMappingURL=utils.js.map