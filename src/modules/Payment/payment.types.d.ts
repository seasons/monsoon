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

export type CreditNoteReasonCode =
  | "ProductUnsatisfactory"
  | "ServiceUnsatisfactory"
  | "OrderChange"
  | "OrderCancellation"
  | "Waiver"
  | "Other"

export type LoadableRecord = "invoice" | "transaction"
