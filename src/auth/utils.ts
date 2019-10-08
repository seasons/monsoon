import * as jwt from "jsonwebtoken"
import { Prisma } from "../prisma"
import { Binding } from "graphql-binding"
import { Request } from "express"
import jwksClient from "jwks-rsa"

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

export async function getUserId(ctx: Context) {
  const user = ctx.request.user
  if (user) {
    return user
  }

  throw new AuthError()
}

export async function createPrismaUser(ctx, idToken) {
  const user = await ctx.db.mutation.createUser({
    data: {
      identity: idToken.sub.split(`|`)[0],
      auth0id: idToken.sub.split(`|`)[1],
      name: idToken.name,
      email: idToken.email,
      avatar: idToken.picture,
    },
  })
  return user
}

export class AuthError extends Error {
  constructor() {
    super("Not authorized")
  }
}
