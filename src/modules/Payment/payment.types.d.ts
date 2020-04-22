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
  status: string
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

export interface Transaction {
  id: string
  amount: number
  masked_card_number: string
  //   UTC timestamp in seconds
  date: number
  status: string
  type?: string
  settled_at?: number
}

export type InvoicesDataLoader = DataLoader<string, Invoice[]>
export type TransactionsDataLoader = DataLoader<string, Transaction[]>
