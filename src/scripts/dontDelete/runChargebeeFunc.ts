import "module-alias/register"

import chargebee from "chargebee"

import { PrismaService } from "../../prisma/prisma.service"

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const run = async () => {
  const ps = new PrismaService()

  const prismaUserId = "ckt3y8o150000zzuv7d7iuesr"

  const lineItemsWithData = [
    { amount: 8900, description: "Hello", avalara_tax_code: "OD020000" },
  ]
  const result = await chargebee.invoice
    .create({
      customer_id: prismaUserId,
      currency_code: "USD",
      charges: lineItemsWithData,
    })
    .request((err, result) => {
      if (err) {
        console.log(err)
        return err
      }
      console.log(result)
      return result
    })
  console.dir(result, { depth: null })
}

run()
