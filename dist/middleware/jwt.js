"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_jwt_1 = __importDefault(require("express-jwt"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
exports.checkJwt = express_jwt_1.default({
    // Dynamically provide a signing key
    // based on the kid in the header and
    // the signing keys provided by the JWKS endpoint.
    secret: jwks_rsa_1.default.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    }),
    // Validate the audience and the issuer.
    credentialsRequired: false,
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: [`RS256`],
});
// For more information on how this works, see:
// https://auth0.com/docs/quickstart/backend/nodejs#create-an-api
// For details on what "jwks" is: https://auth0.com/docs/jwks
// Note that this middleware does not check permissions. It just checks
// that the user's access token is valid and returns a 401 if it isn't.
//# sourceMappingURL=jwt.js.map