import { getUserIfExists, getCustomerFromContext } from "./utils"

const isRequestingUserAlsoOwner = ({ ctx, userId, type, typeId }) =>
  ctx.db.exists[type]({ id: typeId, user: { id: userId } })
const isRequestingUser = ({ ctx, userId }) => ctx.db.exists.User({ id: userId })

export const directiveResolvers = {
  isAuthenticated: (next, source, args, ctx) => {
    getUserIfExists(ctx)
    return next()
  },
  hasRole: async (next, source, { roles }, ctx) => {
    // Extract the auth0Id from the user object on the request
    const { role } = getUserIfExists(ctx)

    if (roles.includes(role)) {
      return next()
    }
    throw new Error(`Unauthorized, incorrect role`)
  },
  isOwner: async (next, source, { type }, ctx) => {
    const { id: typeId } =
      source && source.id
        ? source
        : ctx.request.body.variables
        ? ctx.request.body.variables
        : { id: null }
    const { id: userId } = getUserIfExists(ctx)
    const isOwner =
      type === `User`
        ? userId === typeId
        : await isRequestingUserAlsoOwner({ ctx, userId, type, typeId })
    if (isOwner) {
      return next()
    }
    throw new Error(`Unauthorized, must be owner`)
  },
  isOwnerOrHasRole: async (next, source, { roles, type }, ctx, ...p) => {
    const { id: userId, role } = getUserIfExists(ctx)
    if (roles.includes(role)) {
      return next()
    }

    const { id: typeId } = ctx.request.body.variables
    const isOwner = await isRequestingUserAlsoOwner({
      ctx,
      userId,
      type,
      typeId,
    })

    if (isOwner) {
      return next()
    }
    throw new Error(`Unauthorized, not owner or incorrect role`)
  },
  isCustomerElseFalse: async (next, source, args, ctx) => {
    const customer = await getCustomerFromContext(ctx)
  },
}
