import { userHasRole, getEnforcedUser, isUserOwner } from "./utils"

export async function isOwnerOrHasRole(next, source, { roles, type }, ctx) {
  const user = getEnforcedUser(ctx)
  if (userHasRole(user, roles)) {
    return next()
  }

  const { id: typeId } = ctx.request.body.variables
  const isOwner = await isUserOwner(
    type,
    typeId,
    user.id,
  )

  if (isOwner) {
    return next()
  }
  throw new Error(`Unauthorized, not owner or incorrect role`)
}