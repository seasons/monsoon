jest.mock("airtable", () => ({
  base: () => () => ({
    create: jest.fn(data => data),
    select: () => ({
      firstPage: jest.fn(cb => cb(null, [])),
      eachPage: jest.fn(cb => cb(null, [])),
    }),
  }),
  configure: jest.fn(),
}))
jest.mock("chargebee")
jest.mock("@sendgrid/mail")
