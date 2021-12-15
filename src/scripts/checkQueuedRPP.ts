import "module-alias/register"

import fs from "fs"

import jsonexport from "jsonexport"
import { uniq } from "lodash"
import { DateTime } from "luxon"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const rpps = await ps.client.reservationPhysicalProduct.findMany({
    where: {
      status: "Packed",
    },
    select: {
      id: true,
      //   inboundPackage: true,
      outboundPackage: {
        select: {
          id: true,
          status: true,
          toAddress: {
            select: {
              id: true,
              name: true,
            },
          },
          events: {
            select: {
              status: true,
              subStatus: true,
            },
          },
        },
      },
      packedAt: true,
      createdAt: true,
      status: true,
      reservation: {
        select: {
          customer: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  })

  //   const packages = await ps.client.package.findMany({
  //     where: {},
  //   })

  const filteredrpps = rpps.filter(rpp => {
    const createdAt = DateTime.fromJSDate(rpp.createdAt)
    const packedAt = DateTime.fromJSDate(rpp.packedAt)

    const diff = packedAt.diff(createdAt, ["hours", "minutes"])
    // console.log(rpp.id, diff.toObject())
    return diff.hours > 24
  })

  const customerIds = filteredrpps.map(rpp => rpp.reservation.customer.id)
  const toAddressIds = uniq(
    filteredrpps.map(rpp => rpp.outboundPackage?.toAddress?.id).filter(Boolean)
  )

  const packages = await ps.client.package.findMany({
    where: {
      toAddress: {
        id: {
          in: toAddressIds,
        },
      },
      createdAt: {
        gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
    },
    select: {
      id: true,
      toAddress: {
        select: {
          id: true,
          name: true,
          userId: true,
          user: {
            select: {
              customer: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      shippingLabel: {
        select: {
          id: true,
          trackingNumber: true,
          trackingURL: true,
        },
      },
    },
  })

  //   console.log(filteredrpps.length, " items to check")
  //   console.table(JSON.stringify(filteredrpps, null, 2))

  jsonexport(packages, (err, csv) => {
    // Write csv to file
    if (err) {
      console.error(err)
    }

    console.log(csv)
    console.log(fs.writeFileSync("./packages.csv", csv))
  })
}

run()
