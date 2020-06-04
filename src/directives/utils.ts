import { get } from "lodash"

import { User } from "../prisma"

class AuthError extends Error {
  constructor() {
    super("Not authorized")
  }
}

export const getEnforcedUser = (ctx): User => {
  const user = get(ctx, "req.user")
  if (!user) throw new AuthError()
  return user
}
