import { getEnforcedUser } from "./utils"

export function isAuthenticated(next, source, args, ctx) {
  getEnforcedUser(ctx)
  return next()
}
