import { ChargeBee, _invoice } from "chargebee-typescript"

const allPaidInvoices: typeof chargebee.invoice[] = []

// 1. Get invoices from Chargebee
const chargebee = new ChargeBee()
chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const handleChargebeeResult = (error: Error, result: any) => {
  if (error) {
    console.error(error)
    process.exit(1)
  }
  return result
}

// Since we need to paginate to get all invoices, this is a recursive function
const fetchAllPaidInvoices = async (offset: string) => {
  const result = await chargebee.invoice
    .list({
      limit: 100,
      offset,
      status: { in: ["paid"] },
      "sort_by[asc]": "date",
    })
    .request(handleChargebeeResult)

  for (let i = 0; i < result?.list?.length; i++) {
    const entry = result?.list[i]

    const invoice: typeof chargebee.invoice = entry?.invoice
    allPaidInvoices.push(invoice)
  }

  if (result.next_offset && result.next_offset !== "") {
    await fetchAllPaidInvoices(result.next_offset)
  }
}

const getResyHistoryForInvoices = async () => {
  console.log(4)
  console.log("\n\nTOTAL INVOICES: ", allPaidInvoices.length)

  return
}

const getInvoices = async () => {
  await fetchAllPaidInvoices("")

  await getResyHistoryForInvoices()
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
