import DataLoader from "dataloader"

/**
 * A subset of all the fields specified in chargebee API.
 * For full list, see: https://apidocs.chargebee.com/docs/api/invoices
 */
export interface Invoice {
  id: string
  customer_id: string
  subscription_id?: string
  recurring: boolean
  status: InvoiceStatus
  //   UTC timestamp in seconds
  date?: number
  net_term_days?: number
  currency_code: string
  total?: number
  amount_paid?: number
  amount_adjusted?: number
  write_off_amount?: number
  credits_applied?: number
  linked_payments: { txn_id: string }[]
}

export enum TransactionStatus {
  in_progress,
  success,
  voided,
  failure,
  timeout,
  needs_attention,
}

export enum InvoiceStatus {
  paid,
  posted,
  paymentDue,
  not_paid,
  voided,
  pending,
}

export enum TransactionType {
  authorization,
  payment,
  refund,
  payment_reversal,
}

export type InvoicesDataLoader = DataLoader<string, Invoice[]>
