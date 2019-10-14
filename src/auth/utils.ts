import * as jwt from "jsonwebtoken"
import { Prisma } from "../prisma"
import { Binding } from "graphql-binding"
import { Request } from "express"
import jwksClient from "jwks-rsa"
import request from "request"

export interface Context {
    prisma: Prisma
    db: Binding
    request: Request & { user: any }
}

const jwks = jwksClient({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 1,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
})

export const validateAndParseIdToken = idToken =>
    new Promise((resolve, reject) => {
        const { header, payload } = jwt.decode(idToken, { complete: true }) as any
        if (!header || !header.kid || !payload) reject(new Error("Invalid Token"))
        jwks.getSigningKey(header.kid, (err, key) => {
            if (err) reject(new Error("Error getting signing key: " + err.message))
            jwt.verify(
                idToken,
                (key as any).publicKey,
                { algorithms: ["RS256"] },
                (err, decoded) => {
                    if (err) reject("jwt verify error: " + err.message)
                    resolve(decoded)
                }
            )
        })
    })

export function createAuth0User(email: string, password: string): Promise<string> {
    return new Promise(function CreateUserAndReturnId(resolve, reject) {
        request({
            method: "Post",
            url: `https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`,
            headers: { 'content-type': 'application/json' },
            body: {
                email,
                password,
                "client_id": `${process.env.AUTH0_CLIENTID}`,
                "connection": `${process.env.AUTH0_DB_CONNECTION}`
            },
            json: true
        }, function handleResponse(error, response, body) {
            if (error) {
                reject(new Error(`Error creating Auth0 user: ${error}`))
            }
            if (response.statusCode != 200) {
                reject(new Error(`Error creating new Auth0 user. Auth0 returned ` +
                    `${response.statusCode} with body: ${JSON.stringify(body)}`))
            }
            resolve(body._id)
        })
    })
}

export function getAuth0UserAccessToken(email, password) {
    return new Promise(function RetrieveAccessToken(resolve, reject) {
        request({
            method: "Post",
            url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
            headers: { 'content-type': 'application/json' },
            body: {
                "grant_type": "password",
                "username": email,
                "password": password,
                "audience": `${process.env.AUTH0_AUDIENCE}`,
                "client_id": `${process.env.AUTH0_CLIENTID}`,
                "client_secret": `${process.env.AUTH0_CLIENT_SECRET}`
            },
            json: true
        }, function handleResponse(error, response, body) {
            if (error) {
                reject(new Error(`Error retrieving access token: ${error}`))
            }
            if (response.statusCode != 200) {
                reject(new Error(`Error retrieving access token from Auth0. Auth0 returned ` +
                    `${response.statusCode} with body: ${JSON.stringify(body)}`))
            }
            resolve(body.access_token)
        })
    })
}

export async function getUserId(ctx: Context) {
    const user = ctx.request.user
    if (user) {
        return user
    }

    throw new AuthError()
}

export async function createPrismaUser(ctx, { auth0Id, email, firstName,
    lastName }) {
    const user = await ctx.prisma.createUser({
        auth0Id,
        email,
        firstName,
        lastName,
    })
    return user
}

export class AuthError extends Error {
    constructor() {
        super("Not authorized")
    }
}
