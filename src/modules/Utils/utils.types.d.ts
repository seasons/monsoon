import { Int, InventoryStatus, LetterSize, ProductType } from "@app/prisma"

export interface ProductCountAndStatusSummary {
  total: number
  reserved: number
  reservable: number
  nonReservable: number
  status: string
}

export interface CreateTestPhysicalProductInput {
  inventoryStatus: InventoryStatus
}

export interface CreateTestTopSizeInput {
  letter?: LetterSize
}

export interface CreateTestSizeInput {
  display: String
  top?: CreateTestTopSizeInput
}

export interface CreateTestProductVariantInput {
  physicalProducts: CreateTestPhysicalProductInput[]
  internalSize?: CreateTestSizeInput
}

export interface CreateTestProductInput {
  variants: CreateTestProductVariantInput[]
  type?: ProductType
}

export interface CreateTestProductOutput {
  cleanupFunc: () => void
  product: any
}

export interface CreateTestCustomerDetailInput {
  topSizes?: String[]
  waistSizes?: Int[]
}

export interface CreateTestCustomerInput {
  detail?: CreateTestCustomerDetailInput
}

export interface CreateTestCustomerOutput {
  cleanupFunc: () => void
  customer: any
}
