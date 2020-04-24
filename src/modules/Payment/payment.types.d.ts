import DataLoader from "dataloader"

/**
 * A subset of all the fields specified in chargebee API.
 * For full list, see: https://apidocs.chargebee.com/docs/api/invoices
 * All dates are UTC timestamps in seconds since the Epoch
 */
export interface Invoice {
  id: string
  customer_id: string
  subscription_id?: string
  recurring: boolean
  status: string
  date?: number
  due_date?: number
  net_term_days?: number
  currency_code: string
  total?: number
  amount_paid?: number
  amount_adjusted?: number
  write_off_amount?: number
  credits_applied?: number
  linked_payments: { txn_id: string }[]
}

/**
 * A subset of all the fields specified in chargebee API.
 * For full list, see: https://apidocs.chargebee.com/docs/api/transactions
 * All dates are UTC timestamps in seconds since the Epoch
 */
export interface Transaction {
  id: string
  amount?: number
  masked_card_number?: string
  date?: number
  status?: string
  type: string
  settled_at?: number
  linked_invoices?: { id: string }[]
}

export type InvoicesDataLoader = DataLoader<string, Invoice[]>
export type TransactionsDataLoader = DataLoader<string, Transaction[]>

export interface LoadRecordsWithListInput {
  ids: string[]
  recordName: LoadableRecord
  filterKey?: string
  groupFunc?: (any) => string
  extractFunc?: (valsById: any, id: string) => any
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
