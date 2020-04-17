export type PlanId = "all-access" | "essential"

export interface BillingAddress {
  first_name: string
  last_name: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
}

export interface Card {
  number: string
  expiry_month: string
  expiry_year: string
  cvv: string
}
