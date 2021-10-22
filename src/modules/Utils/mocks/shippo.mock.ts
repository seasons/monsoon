// A generic shippo so we can run shipping service functions without hitting shippo
export class ShippoMock {
  shipment = {
    create: async () => ({
      object_id: "mock-object-id",
      rates: [
        { servicelevel: { token: "ups_ground", amount: 1000 } },
        { servicelevel: { token: "ups_3_day_select", amount: 2000 } },
      ],
    }),
  }
  transaction = {
    create: () =>
      new Promise((resolve, reject) => {
        resolve({
          object_id: "mock-object-id",
          label_url: "mock-label-url",
          tracking_number: "mock-tracking-number",
          tracking_url_provide: "mock-tracking-url-provider",
        })
      }),
  }
  refund = { create: async () => null }
  address = {
    create: async ({
      name,
      company,
      street1,
      street2,
      city,
      state,
      zip,
      country,
      validate,
    }) => ({
      validation_results: { is_valid: true },
      name,
      company,
      street1,
      street2,
      city,
      state,
      zip,
      country,
    }),
  }
}
