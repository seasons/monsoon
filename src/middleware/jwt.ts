import jwt from "express-jwt"
import jwksRsa from "jwks-rsa"

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
export const checkJwt = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 1,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  // Validate the audience and the issuer.
  credentialsRequired: false,
  audience: process.env.AUTH0_AUDIENCE, // the audience of the token is Auth0
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: [`RS256`],
})

// For more information on how this works, see:
// https://auth0.com/docs/quickstart/backend/nodejs#create-an-api
// For details on what "jwks" is: https://auth0.com/docs/jwks

// Note that this middleware does not check permissions. It just checks
// that the user's access token is valid and returns a 401 if it isn't.
