import fs from "fs"

import { Parser } from "json2csv"
import { uniq } from "lodash"

import { PrismaService } from "../../prisma/prisma.service"

const ps = new PrismaService()

const addSaleDiscount = async () => {
  const reservationPhysicalProduct = await ps.client.reservationPhysicalProduct.findMany(
    {
      where: {
        status: {
          in: ["DeliveredToCustomer", "InTransitOutbound", "AtHome"],
        },
      },
      select: {
        physicalProduct: {
          select: {
            id: true,
          },
        },
        customer: {
          select: {
            user: {
              select: {
                id: true,
                email: true,
                lastName: true,
                firstName: true,
              },
            },
          },
        },
      },
    }
  )

  let emails = reservationPhysicalProduct.map(rpp => ({
    email: rpp.customer.user.email,
    fullName: `${rpp.customer.user.firstName} ${rpp.customer.user.lastName}`,
  }))

  let uniqueEmails = [
    ...new Map(emails.map(item => [item["email"], item])).values(),
  ]
  console.log(uniqueEmails)

  const fields = ["email", "fullName"]

  const json2csvParser = new Parser({ fields })
  const csv = json2csvParser.parse(uniqueEmails)
  fs.writeFileSync("./src/scripts/emails.csv", csv, "utf8")

  console.log("Done")
}

addSaleDiscount()
