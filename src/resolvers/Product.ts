import { Context } from "../utils"

export const Product = {
  author: ({ id }, args, ctx: Context) => {
    return ctx.prisma.post({ id }).author()
  },
}
