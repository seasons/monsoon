import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { Prisma } from "@prisma/client"

@Resolver("OrderLineItem")
export class OrderLineItemFieldsResolver {
  constructor() {}

  @ResolveField()
  async physicalProduct(
    @Parent() orderItem,
    @Loader({
      params: {
        model: "PhysicalProduct",
        keyToDataRelationship: "ManyToOne",
      },
      includeInfo: true,
    })
    physicalProductLoader
  ) {
    if (orderItem.recordType && orderItem.recordType === "PhysicalProduct") {
      return await physicalProductLoader.load(orderItem.recordID)
    }

    return null
  }

  @ResolveField()
  async productVariant(
    @Parent() orderItem,
    @Loader({
      params: {
        model: "ProductVariant",
        formatWhere: keys =>
          Prisma.validator<Prisma.ProductVariantWhereInput>()({
            physicalProducts: { some: { id: { in: keys } } },
          }),
        infoFragment: `fragment EnsurePhysicalProduct on ProductVariant {physicalProducts {id}}`,
        getKeys: a => a.physicalProducts.map(a => a.id),
        keyToDataRelationship: "ManyToOne",
      },
      includeInfo: true,
    })
    productVariantFromPhysicalProductLoader,
    @Loader({
      params: {
        model: "ProductVariant",
      },
      includeInfo: true,
    })
    productVariantFromIdLoader
  ) {
    const recordType = orderItem.recordType

    let result = null
    if (recordType === "PhysicalProduct") {
      result = await productVariantFromPhysicalProductLoader.load(
        orderItem.recordID
      )
    } else if (
      recordType === "ProductVariant" ||
      recordType === "ExternalProduct"
    ) {
      result = await productVariantFromIdLoader.load(orderItem.recordID)
    }

    return result
  }
}
