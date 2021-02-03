type MutationInput<T> = { input: T }

export type MutationResult<T> = T & {
  userErrors?: Array<{ field: string; message: string }>
}
export type DraftOrderCreateInputVariables = MutationInput<{
  note: string
  lineItems: Array<{ variantId: string; quantity: number }>
  shippingLine?: { shippingRateHandle: string; price: number; title: string }
  billingAddress: {
    address1: string
    address2: string
    city: string
    province: string
    country: string
    zip: string
    firstName: string
    lastName: string
  }
  customerId: string
  useCustomerDefaultAddress: boolean
  email: string
}>

export type DraftOrder = {
  id?: string
  totalPrice: number
  totalShippingPrice: number
  totalTax: number
  subtotalPrice: number
}
