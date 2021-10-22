export const getPaymentSucceededEvent = (
  customerId,
  chargeType:
    | "essential-1"
    | "essential-2"
    | "essential"
    | "essential-6"
    | "all-access-1"
    | "all-access-2"
    | "all-access"
    | "access-monthly"
    | "access-yearly"
    | "adhoc",
  chargeAmount = undefined
) => {
  const event = { ...PAYMENT_SUCCEEDED_TEMPLATE }
  event.content.transaction.customer_id = customerId
  event.content.invoice.customer_id = customerId
  event.content.customer.id = customerId
  event.content.subscription.customer_id = customerId

  switch (chargeType) {
    case "essential-1":
      event.content.invoice.line_items = [{ ...ESSENTIAL_1_LINE_ITEM }] as any
      break
    case "essential-2":
      event.content.invoice.line_items = [{ ...ESSENTIAL_2_LINE_ITEM }] as any
      break
    case "essential":
      event.content.invoice.line_items = [{ ...ESSENTIAL_LINE_ITEM }] as any
      break
    case "essential-6":
      event.content.invoice.line_items = [{ ...ESSENTIAL_6_LINE_ITEM }] as any
      break
    case "all-access-1":
      event.content.invoice.line_items = [{ ...ALL_ACCESS_1_LINE_ITEM }] as any
      break
    case "all-access-2":
      event.content.invoice.line_items = [{ ...ALL_ACCESS_2_LINE_ITEM }] as any
      break
    case "all-access":
      event.content.invoice.line_items = [{ ...ALL_ACCESS_LINE_ITEM }] as any
      break
    case "access-monthly":
      event.content.invoice.line_items = [
        { ...ACCESS_MONTHLY_LINE_ITEM },
      ] as any
      break
    case "access-yearly":
      event.content.invoice.line_items = [{ ...ACCESS_YEARLY_LINE_ITEM }] as any
      break
    case "adhoc":
      event.content.invoice.line_items = [{ ...ADHOC_LINE_ITEM }] as any
      break
    default:
      throw `invalid chargetyp: ${chargeType}`
  }
  event.content.invoice.line_items[0].customer_id = customerId

  // TODO: override amount if needed
  if (!!chargeAmount) {
    event.content.invoice.line_items[0].amount = chargeAmount
  }

  return event
}

// defaults to an Access Monthly charge
const PAYMENT_SUCCEEDED_TEMPLATE = {
  event_type: "payment_succeeded",
  content: {
    transaction: {
      id: "txn_16Aqc8SmXM4eV5V70",
      customer_id: "cktuy45cq7802542g3iokrgx9mj",
      subscription_id: "169lbNSjhwIUl6A5Q",
      gateway_account_id: "gw_JD8rbbrRhjNh0OZ05",
      payment_source_id: "pm_16COP6SjhwIR962Tv",
      payment_method: "apple_pay",
      gateway: "stripe",
      type: "payment",
      date: 1634873852,
      exchange_rate: 1,
      amount: 2000,
      id_at_gateway: "ch_3JnEZUKj0L34HDec0emzDP69",
      status: "success",
      updated_at: 1634873854,
      fraud_reason: "Payment complete.",
      resource_version: 1634873854350,
      deleted: false,
      object: "transaction",
      currency_code: "USD",
      base_currency_code: "USD",
      amount_unused: 0,
      linked_invoices: [
        {
          invoice_id: "7067",
          applied_amount: 2000,
          applied_at: 1634873854,
          invoice_date: 1634873850,
          invoice_total: 2000,
          invoice_status: "paid",
        },
      ],
      linked_refunds: [],
    },
    invoice: {
      id: "7067",
      customer_id: "cktuy45cq7802542g3iokrgx9mj",
      subscription_id: "169lbNSjhwIUl6A5Q",
      recurring: true,
      status: "paid",
      price_type: "tax_exclusive",
      date: 1634873850,
      due_date: 1634873850,
      net_term_days: 0,
      exchange_rate: 1,
      total: 2000,
      amount_paid: 2000,
      amount_adjusted: 0,
      write_off_amount: 0,
      credits_applied: 0,
      amount_due: 0,
      paid_at: 1634873852,
      updated_at: 1634873854,
      resource_version: 1634873854365,
      deleted: false,
      object: "invoice",
      first_invoice: false,
      amount_to_collect: 0,
      round_off_amount: 0,
      has_advance_charges: false,
      currency_code: "USD",
      base_currency_code: "USD",
      generated_at: 1634873850,
      is_gifted: false,
      term_finalized: true,
      channel: "web",
      tax: 0,
      line_items: [], // fill in,
      sub_total: 2000,
      linked_payments: [
        {
          txn_id: "txn_16Aqc8SmXM4eV5V70",
          applied_amount: 2000,
          applied_at: 1634873854,
          txn_status: "success",
          txn_date: 1634873852,
          txn_amount: 2000,
        },
      ],
      dunning_attempts: [],
      applied_credits: [],
      adjustment_credit_notes: [],
      issued_credit_notes: [],
      linked_orders: [],
      billing_address: {
        first_name: "Chris",
        last_name: "Quintana",
        line1: "104 El Paseo",
        city: "Foothill Ranch",
        state_code: "CA",
        state: "California",
        country: "US",
        zip: "92610",
        validation_status: "partially_valid",
        object: "billing_address",
      },
    },
    customer: {
      id: "cktuy45cq7802542g3iokrgx9mj",
      first_name: "Chris",
      last_name: "Quintana",
      email: "cquintana@ucdavis.edu",
      auto_collection: "on",
      net_term_days: 0,
      allow_direct_debit: false,
      created_at: 1632281849,
      taxability: "taxable",
      updated_at: 1632281850,
      pii_cleared: "active",
      channel: "web",
      resource_version: 1632281850149,
      deleted: false,
      object: "customer",
      billing_address: {
        first_name: "Chris",
        last_name: "Quintana",
        line1: "104 El Paseo",
        city: "Foothill Ranch",
        state_code: "CA",
        state: "California",
        country: "US",
        zip: "92610",
        validation_status: "partially_valid",
        object: "billing_address",
      },
      promotional_credits: 0,
      refundable_credits: 0,
      excess_payments: 0,
      unbilled_charges: 0,
      preferred_currency_code: "USD",
      primary_payment_source_id: "pm_16COP6SjhwIR962Tv",
      payment_method: {
        object: "payment_method",
        type: "apple_pay",
        reference_id: "cus_KGu5C1LAPYMt5J/card_1JcMGyKj0L34HDecuiawViET",
        gateway: "stripe",
        gateway_account_id: "gw_JD8rbbrRhjNh0OZ05",
        status: "valid",
      },
    },
    subscription: {
      id: "169lbNSjhwIUl6A5Q",
      plan_id: "access-monthly",
      plan_quantity: 1,
      plan_unit_price: 2000,
      billing_period: 1,
      billing_period_unit: "month",
      customer_id: "cktuy45cq7802542g3iokrgx9mj",
      plan_amount: 2000,
      plan_free_quantity: 0,
      status: "active",
      current_term_start: 1634873850,
      current_term_end: 1637555850,
      next_billing_at: 1637555850,
      created_at: 1632281850,
      started_at: 1632281850,
      activated_at: 1632281850,
      updated_at: 1634873854,
      has_scheduled_changes: false,
      channel: "web",
      resource_version: 1634873854404,
      deleted: false,
      object: "subscription",
      currency_code: "USD",
      due_invoices_count: 0,
      mrr: 2000,
      exchange_rate: 1,
      base_currency_code: "USD",
    },
  },
}

const ADHOC_LINE_ITEM = {
  id: "li_16CVvZSmL1SI8GCPa",
  date_from: 1632178802,
  date_to: 1634688000,
  unit_amount: 1500,
  quantity: 1,
  amount: 1500,
  pricing_model: "flat_fee",
  is_taxed: true,
  tax_amount: 131,
  tax_rate: 8.875,
  object: "line_item",
  subscription_id: "AzZcmUS5PiQAy1ZyJ",
  customer_id: "ck2hz5jjc003n0799wljleiag",
  description: "Grace - Leopard (Universal) for 30 days at $15 per mo.",
  entity_type: "adhoc",
  discount_amount: 31,
  item_level_discount_amount: 0,
}

const ACCESS_MONTHLY_LINE_ITEM = {
  id: "li_16Aqc8SmXM4Ub5V6P",
  date_from: 1634873850,
  date_to: 1637555850,
  unit_amount: 2000,
  quantity: 1,
  amount: 2000,
  pricing_model: "flat_fee",
  is_taxed: false,
  tax_amount: 0,
  object: "line_item",
  subscription_id: "169lbNSjhwIUl6A5Q",
  customer_id: "cktuy45cq7802542g3iokrgx9mj",
  description: "Access Monthly",
  entity_type: "plan",
  entity_id: "access-monthly",
  tax_exempt_reason: "export",
  discount_amount: 0,
  item_level_discount_amount: 0,
}

const ACCESS_YEARLY_LINE_ITEM = {
  id: "li_16Aqc8SmXM4Ub5V6P",
  date_from: 1634873850,
  date_to: 1637555850,
  unit_amount: 19500,
  quantity: 1,
  amount: 19500,
  pricing_model: "flat_fee",
  is_taxed: false,
  tax_amount: 0,
  object: "line_item",
  subscription_id: "169lbNSjhwIUl6A5Q",
  customer_id: "cktuy45cq7802542g3iokrgx9mj",
  description: "Access Yearly",
  entity_type: "plan",
  entity_id: "access-yearly",
  tax_exempt_reason: "export",
  discount_amount: 0,
  item_level_discount_amount: 0,
}

const ESSENTIAL_1_LINE_ITEM = {
  id: "li_16Aqc8SmXM4Ub5V6P",
  date_from: 1634873850,
  date_to: 1637555850,
  unit_amount: 2000,
  quantity: 1,
  amount: 6500,
  pricing_model: "flat_fee",
  is_taxed: false,
  tax_amount: 0,
  object: "line_item",
  subscription_id: "169lbNSjhwIUl6A5Q",
  customer_id: "cktuy45cq7802542g3iokrgx9mj",
  description: "Essential 1",
  entity_type: "plan",
  entity_id: "essential-1",
  tax_exempt_reason: "export",
  discount_amount: 0,
  item_level_discount_amount: 0,
}

const ESSENTIAL_2_LINE_ITEM = {
  id: "li_16Aqc8SmXM4Ub5V6P",
  date_from: 1634873850,
  date_to: 1637555850,
  unit_amount: 9500,
  quantity: 1,
  amount: 9500,
  pricing_model: "flat_fee",
  is_taxed: false,
  tax_amount: 0,
  object: "line_item",
  subscription_id: "169lbNSjhwIUl6A5Q",
  customer_id: "cktuy45cq7802542g3iokrgx9mj",
  description: "Essential 2",
  entity_type: "plan",
  entity_id: "essential-2",
  tax_exempt_reason: "export",
  discount_amount: 0,
  item_level_discount_amount: 0,
}

const ESSENTIAL_LINE_ITEM = {
  id: "li_16Aqc8SmXM4Ub5V6P",
  date_from: 1634873850,
  date_to: 1637555850,
  unit_amount: 12500,
  quantity: 1,
  amount: 12500,
  pricing_model: "flat_fee",
  is_taxed: false,
  tax_amount: 0,
  object: "line_item",
  subscription_id: "169lbNSjhwIUl6A5Q",
  customer_id: "cktuy45cq7802542g3iokrgx9mj",
  description: "Essential",
  entity_type: "plan",
  entity_id: "essential",
  tax_exempt_reason: "export",
  discount_amount: 0,
  item_level_discount_amount: 0,
}

const ESSENTIAL_6_LINE_ITEM = {
  id: "li_16Aqc8SmXM4Ub5V6P",
  date_from: 1634873850,
  date_to: 1637555850,
  unit_amount: 21500,
  quantity: 1,
  amount: 21500,
  pricing_model: "flat_fee",
  is_taxed: false,
  tax_amount: 0,
  object: "line_item",
  subscription_id: "169lbNSjhwIUl6A5Q",
  customer_id: "cktuy45cq7802542g3iokrgx9mj",
  description: "Essential 6",
  entity_type: "plan",
  entity_id: "essential-6",
  tax_exempt_reason: "export",
  discount_amount: 0,
  item_level_discount_amount: 0,
}

const ALL_ACCESS_1_LINE_ITEM = {
  id: "li_16Aqc8SmXM4Ub5V6P",
  date_from: 1634873850,
  date_to: 1637555850,
  unit_amount: 10500,
  quantity: 1,
  amount: 10500,
  pricing_model: "flat_fee",
  is_taxed: false,
  tax_amount: 0,
  object: "line_item",
  subscription_id: "169lbNSjhwIUl6A5Q",
  customer_id: "cktuy45cq7802542g3iokrgx9mj",
  description: "All Access 1",
  entity_type: "plan",
  entity_id: "all-access-1",
  tax_exempt_reason: "export",
  discount_amount: 0,
  item_level_discount_amount: 0,
}

const ALL_ACCESS_2_LINE_ITEM = {
  id: "li_16Aqc8SmXM4Ub5V6P",
  date_from: 1634873850,
  date_to: 1637555850,
  unit_amount: 14500,
  quantity: 1,
  amount: 14500,
  pricing_model: "flat_fee",
  is_taxed: false,
  tax_amount: 0,
  object: "line_item",
  subscription_id: "169lbNSjhwIUl6A5Q",
  customer_id: "cktuy45cq7802542g3iokrgx9mj",
  description: "All Access 2",
  entity_type: "plan",
  entity_id: "all-access-2",
  tax_exempt_reason: "export",
  discount_amount: 0,
  item_level_discount_amount: 0,
}

const ALL_ACCESS_LINE_ITEM = {
  id: "li_16Aqc8SmXM4Ub5V6P",
  date_from: 1634873850,
  date_to: 1637555850,
  unit_amount: 17500,
  quantity: 1,
  amount: 17500,
  pricing_model: "flat_fee",
  is_taxed: false,
  tax_amount: 0,
  object: "line_item",
  subscription_id: "169lbNSjhwIUl6A5Q",
  customer_id: "cktuy45cq7802542g3iokrgx9mj",
  description: "All Access",
  entity_type: "plan",
  entity_id: "all-access",
  tax_exempt_reason: "export",
  discount_amount: 0,
  item_level_discount_amount: 0,
}
