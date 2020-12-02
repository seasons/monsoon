import {
  CustomerStatus,
  Int,
  InventoryStatus,
  LetterSize,
  ProductType,
} from "@app/prisma"
import { DateTime } from "@app/prisma/prisma.binding"

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
  phoneOS?: string
}

export interface CreateTestPauseRequestInput {
  pausePending: boolean
  pauseDate?: DateTime
  resumeDate?: DateTime
  notified?: boolean
}

export interface CreateTestCustomerMembershipInput {
  pauseRequests: CreateTestPauseRequestInput[]
}
export interface CreateTestCustomerInput {
  email?: string
  detail?: CreateTestCustomerDetailInput
  status?: CustomerStatus
  membership?: CreateTestCustomerMembershipInput
}

export interface CreateTestCustomerOutput {
  cleanupFunc: () => void
  customer: any
}
