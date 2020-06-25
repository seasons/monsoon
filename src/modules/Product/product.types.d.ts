import { ID_Input } from "@app/prisma"

export interface ProductWithPhysicalProducts {
  id: ID_Input
  variants: ProductVariantWithPhysicalProducts[]
}

interface ProductVariantWithPhysicalProducts {
  id: ID_Input
  physicalProducts: {
    id: ID_Input
  }[]
}

export interface ProductUpdateMutationInput extends ProductUpdateInput {
  // Custom fields
  bottomSizeType: BottomSizeType
  functions: [!String]
  images: [!Upload]
  modelSizeDisplay: String
  modelSizeName: String
  tags: [!String]
}
