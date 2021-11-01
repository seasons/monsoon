export const getPromotionalCreditsAddedEvent = (
  customerId,
  amount,
  description
) => {
  const event = { ...PROMOTIONAL_CREDITS_ADDED_TEMPLATE }
  event.content.customer.id = customerId
  event.content.promotional_credit.customer_id = customerId
  event.content.promotional_credit.amount = amount

  event.content.promotional_credit.description = description

  return event
}

const PROMOTIONAL_CREDITS_ADDED_TEMPLATE = {
  event_type: "promotional_credits_added",
  content: {
    customer: {
      id: "ckq9jhprp2xwc0739rnsydpyu",
      first_name: "Nicolas",
      last_name: "Crowell",
      email: "nicolas.crowell@gmail.com",
      auto_collection: "on",
      net_term_days: 0,
      allow_direct_debit: false,
      created_at: 1624456712,
      taxability: "taxable",
      updated_at: 1634864418,
      pii_cleared: "active",
      resource_version: 1634864418210,
      deleted: false,
      object: "customer",
      billing_address: {
        first_name: "Nicolas",
        last_name: "Crowell",
        line1: "45 Encline Ct",
        city: "san francisco",
        state_code: "CA",
        state: "California",
        country: "US",
        zip: "94127",
        validation_status: "partially_valid",
        object: "billing_address",
      },
      card_status: "valid",
      balances: [
        {
          promotional_credits: 2010,
          excess_payments: 0,
          refundable_credits: 0,
          unbilled_charges: 0,
          object: "customer_balance",
          currency_code: "USD",
          balance_currency_code: "USD",
        },
      ],
      promotional_credits: 2010,
      refundable_credits: 0,
      excess_payments: 0,
      unbilled_charges: 0,
      preferred_currency_code: "USD",
      primary_payment_source_id: "pm_Azq8XjSbAMpe6Rcx",
      payment_method: {
        object: "payment_method",
        type: "card",
        reference_id: "cus_JiyYIHJGHd6szJ/pm_1J5Wb3Kj0L34HDec8KOt5Sto",
        gateway: "stripe",
        gateway_account_id: "gw_JD8rbbrRhjNh0OZ05",
        status: "valid",
      },
      channel: "web",
    },
    promotional_credit: {
      id: "pc_Azq8S4SmWiUMp56wE",
      customer_id: "ckq9jhprp2xwc0739rnsydpyu",
      type: "increment",
      amount: 2010,
      description: "Grandfathered essential credits",
      credit_type: "general",
      closing_balance: 2010,
      done_by: "full_access_key_v1",
      created_at: 1634864418,
      object: "promotional_credit",
      currency_code: "USD",
    },
  },
}
