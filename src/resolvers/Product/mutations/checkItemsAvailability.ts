import { Context } from "../../../utils"
import {
  getUserRequestObject,
  getCustomerFromContext,
} from "../../../auth/utils"
import { updateProductVariantCounts } from "../updateProductVariantCounts"

export async function checkItemsAvailability(
  parent,
  { items },
  ctx: Context,
  info
) {
  const userRequestObject = await getUserRequestObject(ctx)
  const customer = await getCustomerFromContext(ctx)

  const reservedBagItems = await ctx.db.query.bagItems(
    {
      where: {
        customer: {
          id: customer.id,
        },
        productVariant: {
          id_in: items,
        },
        status_not: "Added",
      },
    },
    `{
      productVariant {
        id
      }
    }`
  )

  const reservedIds = reservedBagItems.map(a => a.productVariant.id)
  const newItems = items.filter(a => !reservedIds.includes(a))

  await updateProductVariantCounts(newItems, ctx, {
    dryRun: true,
  })

  return true
}
