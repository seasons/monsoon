import { Context } from "../utils"

export const PhysicalProduct = {
  async productVariant(parent, args, ctx: Context, info) {
    const productVariant = await ctx.prisma
      .physicalProduct({
        id: parent.id,
      })
      .productVariant()

    return ctx.db.query.productVariant(
      {
        where: {
          id: productVariant.id,
        },
      },
      info
    )
  },
}
