import * as jwt from "jsonwebtoken"
import jwksClient from "jwks-rsa"
import { Context } from "../utils"
import get from "lodash.get"
import { Customer, User } from "../prisma"
import { head } from "lodash"

export const PW_STRENGTH_RULES_URL =
  "https://manage.auth0.com/dashboard/us/seasons/connections/database/con_btTULQOf6kAxxbCz/security"

const jwks = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 1,
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
})

export async function validateAndParseIdToken(idToken) {
  return new Promise((resolve, reject) => {
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
}

// retrieves the user indicated by the JWT token on the request.
// If no such user exists, throws an error.
export async function getUserFromContext(ctx: Context): Promise<User> {
  return new Promise(async function getCustomerFromToken(resolve, reject) {
    if (!ctx.req.user) {
      return reject("no user on context")
    }
    let userExists = false

    // Does such a user exist?
    const auth0Id = ctx.req?.user?.sub?.split("|")[1] // e.g "auth0|5da61ffdeef18b0c5f5c2c6f"
    try {
      userExists = await ctx.prisma.$exists.user({ auth0Id })
    } catch (err) {
      console.log(err)
    }
    if (!userExists) {
      reject(
        `token does not correspond to any known user. User Auth0ID: ${auth0Id}`
      )
    }

    // User exists. Let's return
    let user = await ctx.prisma.user({ auth0Id })
    resolve(user)
  })
}

export async function getCustomerFromContext(ctx: Context): Promise<Customer> {
  // Get the user on the context
  const user = await getUserFromContext(ctx) // will throw error if user doesn't exist

  if (user.role !== "Customer") {
    throw new Error(
      `token belongs to a user of type ${user.role}, not Customer`
    )
  }

  // Get the customer record corresponding to that user
  return head(
    await ctx.prisma.customers({
      where: { user: { id: user.id } },	  
    })
  )
}

export interface UserRequestObject {
  iss: string
  sub: string
  aud: string
  iat: number
  exp: number
  azp: string
  scope: string
  gty: string
  updatedAt: string
  email: string
  role: string
  lastName: string
  firstName: string
  id: string
  createdAt: string
  auth0Id: string
}

export function getUserRequestObject(ctx: Context): UserRequestObject {
  const user = ctx.req.user
  if (user) {
    return user
  }

  throw new AuthError()
}

export async function createPrismaUser(
  ctx: Context,
  { auth0Id, email, firstName, lastName }
) {
  const user = await ctx.prisma.createUser({
    auth0Id,
    email,
    firstName,
    lastName,
  })
  return user
}

export async function createPrismaCustomerForExistingUser(
  ctx: Context,
  { userID, details = {}, status }
) {
  const customer = await ctx.prisma.createCustomer({
    user: {
      connect: { id: userID },
    },
    detail: { create: details },
    status: status || "Waitlisted",
  })

  // TODO: update airtable with customer data

  return customer
}

export class AuthError extends Error {
  constructor() {
    super("Not authorized")
  }
}

export const isLoggedIn = ctx => {
  return !!get(ctx, "req.user")
}

export const getUserIfExists = ctx => {
  const user = get(ctx, "req.user")
  if (!user) throw new Error(`Not logged in`)
  return user
}
