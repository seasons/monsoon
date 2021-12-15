export const getPaymentSourceUpdatedEvent = customerId => {
  return {
    event_type: "payment_source_updated",
    content: { customer: { id: customerId } },
  }
}
