import { get } from "lodash"
import { AuthError } from "./utils"

export function hasRole(next, source, { roles }, ctx) {
  // Todo: test when addCustomerDetails mutation is complete

  // Extract the auth0Id from the user object on the request
  const user = get(ctx, "req.user")
  if (!user) throw new AuthError()

  if (!roles.includes(user.role)) {
    throw new Error(`Unauthorized, incorrect role`)
  }
  return next()
}