import { get } from "lodash"
import { AuthError } from "./utils"

export function isAuthenticated(next, source, args, ctx) {
  const user = get(ctx, "req.user")
  if (!user) throw new AuthError()
  return next()
}