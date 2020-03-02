import { get } from "lodash"
import { DBService } from "../prisma/db.service"

const db = new DBService()

export class AuthError extends Error {
  constructor() {
    super("Not authorized")
  }
}

export const isRequestingUserAlsoOwner = (userId, type, typeId) =>
  db.exists[type]({ id: typeId, user: { id: userId } })

export const getUserIfExists = ctx => {
  const user = get(ctx, "req.user")
  if (!user) throw new AuthError()
  return user
}