import { ProductVariant, Size, PhysicalProduct } from "../prisma"

export interface ProductVariantWithNeededFields {
  yarn
  product: { slug: string }
  size: Size
}
export function getCorrespondingAirtableProductVariant(
  allAirtableProducts: any[],
  allAirtableProductVariants: any[],
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

export function getCorrespondingAirtablePhysicalProduct(
  allAirtablePhysicalProducts,
  prismaPhysicalProduct
) {
  return allAirtablePhysicalProducts.find(
    physProd => physProd.fields.SUID.text === prismaPhysicalProduct.seasonsUID
  )
}
