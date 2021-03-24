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

export interface CustomBrandCreateOrUpdateInput {
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
  logo?: any
  images?: any[]
  externalShopifyIntegration?: ExternalShopifyIntegrationInput
}

interface ExternalShopifyIntegrationInput {
  shopName: string
  enabled: boolean
  accessToken?: string
}

interface ProductCreateManyWithoutBrandInput {
  create: any
  connect: any
}
