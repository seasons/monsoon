export interface ProductWithPhysicalProducts {
  id: string
  variants: ProductVariantWithPhysicalProducts[]
}

interface ProductVariantWithPhysicalProducts {
  id: string
  physicalProducts: {
    id: string
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
