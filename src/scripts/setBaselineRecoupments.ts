import { ChargeBee, _invoice } from "chargebee-typescript"

// 1. Get invoices from Chargebee
const chargebee = new ChargeBee()
chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const handleChargebeeResult = (err, result) => {
  if (err) {
    process.exit(1)
  }

  const output: typeof chargebee.invoice[] = []

  for (let i = 0; i < result.list.length; i++) {
    const entry = result.list[i]
    console.log(`${entry}`)

    const invoice: typeof chargebee.invoice = entry.invoice
    output.push(invoice)
  }

  return output
}

// TODO: limit to 100, offset, iterate to get all 5,866 invoices
const fetchAllPaidInvoices = async () => {
  return await chargebee.invoice
    .list({
      limit: 1,
      offset: '["1632133384000","160404340"]',
      status: { in: ["paid"] },
      "sort_by[asc]": "date",
    })
    .request(handleChargebeeResult)
}

const getInvoices = async () => {
  await fetchAllPaidInvoices()
}

getInvoices()

// 2. Correlate with reservation history
// ****************************************************************
// Invoice > via customer_id >> Reservation >> PhysicalProduct
// ****************************************************************

// 3. Calculate recoupment for PhysicalProduct
// ****************************************************************
// RECOUPMENT = SUM(ALL_PAYMENTS_TO_DATE) / PRODUCT_WHOLESALE_PRICE
// ****************************************************************

// 4. Update recoupment in DB
