import { Context } from "../../../utils"
import { getCustomerFromContext } from "../../../auth/utils"

export async function isSaved(parent, {}, ctx: Context, info) {
  let customer
  try {
    customer = await getCustomerFromContext(ctx)
  } catch (error) {
    return false
  }

  const productVariants = await ctx.prisma.productVariants({
    where: {
      product: {
        id: parent.id,
      },
    },
  })

  const bagItem = await ctx.prisma.bagItems({
    where: {
      customer: {
        id: customer.id,
      },
      productVariant: {
        id_in: productVariants.map(a => a.id),
      },
      saved: true,
    },
  })

  return bagItem.length > 0
}
