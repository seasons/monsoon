import DataLoader from "dataloader"

/**
 * A subset of all the fields specified in chargebee API.
 * For full list, see: https://apidocs.chargebee.com/docs/api/invoices
 * All dates are UTC timestamps in seconds since the Epoch
 */
export interface Invoice {
  id: string
  customerId: string
  subscriptionId?: string
  recurring: boolean
  status: string
  date?: number
  dueDate?: number
  netTermDays?: number
  currencyCode: string
  total?: number
  amountPaid?: number
  amountAdjusted?: number
  writeOffAmount?: number
  creditsApplied?: number
  issuedCreditNotes?: CreditNote[]
  linkedPayments: { txnId: string }[]
  lineItems: LineItem[]
  billingAddress: ChargebeeBillingAddress
}

export type LineItemIdentityType = "PlanSetup" | "Plan" | "Addon"

export interface ChargebeeBillingAddress {
  firstName: String
  lastName: String
  line1: String
  line2: String
  line3: String
  city: String
  state: String
  zip: String
}
export interface LineItem {
  id: String
  dateFrom: number // seconds since epoch
  dateTo: number // seconds since epoch
  isTaxed: Boolean
  taxAmount?: Number
  taxRate?: Number
  discountAmount?: Number
  description: String
  entityDescription?: String
  entityType: LineItemIdentityType
  entityId?: String
  amount: Number
}
export interface CreditNote {
  id: string
  reasonCode: string
  date: number
  total: number
  status: string
}

/**
 * A subset of all the fields specified in chargebee API.
 * For full list, see: https://apidocs.chargebee.com/docs/api/transactions
 * All dates are UTC timestamps in seconds since the Epoch
 */
export interface Transaction {
  id: string
  amount?: number
  maskedCardNumber?: string
  date?: number
  status?: string
  type: string
  settledAt?: number
  linkedInvoices?: { id: string }[]
}

export type InvoicesDataLoader = DataLoader<string, Invoice[]>
export type TransactionsDataLoader = DataLoader<string, Transaction[]>

export interface LoadRecordsWithListInput {
  ids: string[]
  recordName: LoadableRecord
  filterKey?: string
  groupFunc?: (any) => string
  extractFunc?: (valsById: any, id: string) => any
  transformFunc?: (any) => any
}

export interface LoadAllRecordsWithListInput extends LoadRecordsWithListInput {
  maxIds: number
}

export interface RefundInvoiceInput {
  invoiceId: String
  refundAmount?: number
  comment?: String
  customerNotes?: String
  reasonCode?: CreditNoteReasonCode
}

export interface Coupon {
  id: string
  amount: number
  percentage: number
  type: CouponType
}

export type CreditNoteReasonCode =
  | "ProductUnsatisfactory"
  | "ServiceUnsatisfactory"
  | "OrderChange"
  | "OrderCancellation"
  | "Waiver"
  | "Other"

export type LoadableRecord = "invoice" | "transaction"
export type PlanId = "all-access" | "essential"
export type CouponType = "FixedAmount" | "Percentage"

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
