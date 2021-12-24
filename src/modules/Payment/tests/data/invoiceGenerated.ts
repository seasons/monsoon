import cuid from "cuid"

export interface LineItemInput {
  amount: number
}

export const getInvoiceGeneratedEvent = (
  customerId: string,
  lineItems: LineItemInput[]
) => {
  return {
    event_type: "invoice_generated",
    content: {
      invoice: {
        id: cuid(),
        customer_id: customerId,
        status: "paid",
        date: Math.round(new Date().getTime() / 1000), // seconds since epoch
        total: lineItems.reduce((acc, item) => acc + item.amount, 0),
        line_items: lineItems.map(a => ({ id: cuid(), amount: a.amount })),
      },
    },
  }
}
