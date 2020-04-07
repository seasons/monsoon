import { PrismaService } from "../prisma/prisma.service"
import { User } from "../prisma"
import { get } from "lodash"

const prisma = new PrismaService()

class AuthError extends Error {
  constructor() {
    super("Not authorized")
  }
}

const isRequestingUserAlsoOwner = async (
  userId,
  type,
  typeId
): Promise<boolean> =>
  await prisma.binding.exists[type]({ id: typeId, user: { id: userId } })

export const isUserOwner = async (type, typeId, userId): Promise<boolean> => {
  return type === `User`
    ? userId === typeId
    : await isRequestingUserAlsoOwner(userId, type, typeId)
}

export const userHasRole = (user, roles): boolean => {
  return roles.includes(user.role)
}

export const getEnforcedUser = (ctx): User => {
  const user = get(ctx, "req.user")
  if (!user) throw new AuthError()
  return user
}
