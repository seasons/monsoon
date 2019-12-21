import { Context } from "../utils"

export const CollectionGroups = (parent, args, ctx: Context, info) => {
  return ctx.db.query.collectionGroup(args, info)
}
