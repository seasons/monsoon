import { ProductVariant, Size, PhysicalProduct } from "../src/prisma"

export interface ProductVariantWithNeededFields {
  product: { slug: string }
  size: Size
}
export function getCorrespondingAirtableProductVariant(
  allAirtableProducts: Array<any>,
  allAirtableProductVariants: Array<any>,
  prismaProductVariant: ProductVariantWithNeededFields
) {
  const correspondingAirtableProduct = allAirtableProducts.find(
    //@ts-ignore
    prod => prod.fields.Slug === prismaProductVariant.product.slug
  )
  const candidateProductVariants = allAirtableProductVariants.filter(prodVar =>
    correspondingAirtableProduct.fields["Product Variants"].includes(prodVar.id)
  )
  const correspondingAirtableProductVariant = candidateProductVariants.find(
    prodVar => prodVar.fields.Size === prismaProductVariant.size
  )

  return correspondingAirtableProductVariant
}
