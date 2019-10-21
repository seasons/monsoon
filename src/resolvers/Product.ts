import { Context } from "../utils"
import { getUserId } from "../auth/utils"
import { base } from "../airtable/config"

export const Product = {}

export const ProductMutations = {
  async reserveItems(parent, { items }, ctx: Context, info) {
    const user = await getUserId(ctx)
    console.log(user, items)

    // Check if physical product is available for each product variant
    const variants = await ctx.prisma.productVariants({
      where: { id_in: items },
    })

    for (let variant of variants) {
    }
    // If they are decrement count and

    // Notify user about reservation via email
    // Create reservation record in airtable
  },
}
