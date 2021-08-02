import { DateTime } from "@app/prisma/prisma.binding"
import {
  CustomerStatus,
  InventoryStatus,
  LetterSize,
  PauseType,
  ProductType,
} from "@prisma/client"

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

export interface CreateTestProductVariantInput {
  physicalProducts: CreateTestPhysicalProductInput[]
  displayShort?: String
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
  topSizes?: string[]
  waistSizes?: number[]
  phoneOS?: string
}

export interface CreateTestPauseRequestInput {
  pausePending: boolean
  pauseDate?: DateTime
  resumeDate?: DateTime
  notified: boolean
  pauseType: PauseType
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
