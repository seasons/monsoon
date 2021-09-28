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

  for (var i = 0; i < result.list.length; i++) {
    var entry = result.list[i]
    console.log(`${entry}`)
    var invoice: typeof chargebee.invoice = entry.invoice

    output.push(invoice)
  }

  return output
}

// TODO: limit to 100, offset, iterate to get all 5,866 invoices
const fetchAllPaidInvoices = async () => {
  return await chargebee.invoice
    .list({
      limit: 1,
      status: { in: ["paid"] },
      "sort_by[asc]": "date",
    })
    .request(handleChargebeeResult)
}

const run = async () => {
  await fetchAllPaidInvoices()
}
run()

// 2. Correlate with reservation history

// 3. Calculate recoupment for physicalProduct

// 4. Update recoupment in DB
// import { PrismaService } from "../prisma/prisma.service"

// const run = async () => {
//   const ps = new PrismaService()

//   await ps.client.product.updateMany({
//     where: { recoupment: 4 },
//     data: {
//       recoupment: null,
//     },
//   })
// }
// run()
