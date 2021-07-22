import "module-alias/register"

import chargebee from "chargebee"
import { DateTime } from "luxon"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const pauseRequests = await ps.client2.pauseRequest.findMany()

  let count = 0
  for (const pr of pauseRequests) {
    const malformedPauseDate =
      !pr.pauseDate ||
      DateTime.fromISO(pr.pauseDate.toISOString()) <
        DateTime.local().minus({ years: 4 })
    const malformedResumeDate =
      !pr.resumeDate ||
      DateTime.fromISO(pr.resumeDate.toISOString()) <
        DateTime.local().minus({ years: 4 })

    if (malformedPauseDate || malformedResumeDate) {
      count++
      const membershipWithCustomer = await ps.client2.customerMembership.findUnique(
        {
          where: { id: pr.membershipId },
          select: {
            id: true,
            subscription: {
              select: { id: true, currentTermEnd: true },
            },
          },
        }
      )

      const termEnd = membershipWithCustomer?.subscription.currentTermEnd.toISOString()
      const resumeDateISO = DateTime.fromISO(termEnd)
        .plus({ months: 1 })
        .toISO()

      console.log(
        "pauseDate new: ",
        termEnd,
        " /  old pauseDate: ",
        pr.pauseDate
      )
      console.log(
        "resumeDate new:",
        resumeDateISO,
        " /  old resumeDate: ",
        pr.resumeDate
      )

      //   if (
      //     DateTime.fromISO(resumeDateISO) > DateTime.local().plus({ months: 4 })
      //   ) {
      //     console.log("??????", membershipWithCustomer.id)
      //   }

      return await ps.client2.pauseRequest.update({
        where: {
          id: pr.id,
        },
        data: {
          pauseDate: termEnd,
          resumeDate: resumeDateISO,
        },
      })
    }
  }
  console.log("Ran on ", count)
}
run()
