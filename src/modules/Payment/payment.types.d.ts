export type PlanId = "all-access" | "essential"

export interface BillingAddress {
  firstName: string
  lastName: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
}

export interface Card {
  number: string
  expiryMonth: string
  expiryYear: string
  cvv: string
}
