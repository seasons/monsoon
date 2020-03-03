import { isRequestingUserAlsoOwner, getUserIfExists } from "./utils"

export async function isOwner(next, source, { type }, ctx) {
  const { id: typeId } =
    source && source.id
      ? source
      : ctx.request.body.variables || { id: null }
  const { id: userId } = getUserIfExists(ctx)
  const isOwner =
    type === `User`
      ? userId === typeId
      : await isRequestingUserAlsoOwner(userId, type, typeId)
  if (!isOwner) {
    throw new Error(`Unauthorized, must be owner`)
  }
  return next()
}