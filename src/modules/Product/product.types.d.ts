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

export interface CustomBrandCreateOrUpdateData {
  id: string
  slug: string
  designer?: string
  published?: boolean
  featured?: boolean
  brandCode: string
  description?: string
  isPrimaryBrand?: boolean
  name: string
  basedIn?: string
  since?: string
  tier: string
  websiteUrl?: string
  products?: ProductCreateManyWithoutBrandInput
  logoImage?: any
  images?: any[]
  shopifyShop?: ShopifyShopInput
}

interface ShopifyShopInput {
  shopName: string
  enabled: boolean
  accessToken?: string
}

interface ProductCreateManyWithoutBrandInput {
  create: any
  connect: any
}
