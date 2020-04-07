import { getEnforcedUser, isUserOwner } from "./utils"

export async function isOwner(next, source, { type }, ctx) {
  const { id: typeId } =
    source && source.id ? source : ctx.request.body.variables || { id: null }
  const { id: userId } = getEnforcedUser(ctx)
  const isOwner = isUserOwner(type, typeId, userId)
  if (!isOwner) {
    throw new Error(`Unauthorized, must be owner`)
  }
  return next()
}
