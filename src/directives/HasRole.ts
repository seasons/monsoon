import { getEnforcedUser } from "./utils"

export function hasRole(next, source, { roles }, ctx) {
  // Todo: test when addCustomerDetails mutation is complete
  const user = getEnforcedUser(ctx)

  if (!roles.includes(user.role)) {
    throw new Error(`Unauthorized, incorrect role`)
  }
  return next()
}