import * as fs from "fs"

import { Customer, EmailId } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import { uniqBy } from "lodash"
import { DateTime } from "luxon"
import moment from "moment"
import zipcodes from "zipcodes"

@Injectable()
export class AdmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  weServiceZipcode(zipcode: string): boolean {
    const state = zipcodes.lookup(zipcode)?.state
    let { states } = JSON.parse(
      fs.readFileSync(
        process.cwd() + "/src/modules/User/admissableStates.json",
        "utf-8"
      )
    )
    return states.includes(state)
  }

  // TODO: Test function
  async belowWeeklyNewActiveUsersOpsThreshold(): Promise<boolean> {
    const emailsSent = await this.prisma.binding.query.emailReceipts(
      {
        where: {
          emailId_in: ["WelcomeToSeasons", "CompleteAccount", "PriorityAccess"],
        },
        orderBy: "createdAt_DESC",
      },
      `{
        createdAt
        user {
          id
        }
      }`
    )
    const now = moment(new Date())
    const emailsSentPastWeek = emailsSent.filter(a => {
      const numDaysSinceEmailSent = now.diff(moment(a.createdAt))
      return numDaysSinceEmailSent <= 6 // 0-6 is 7 days
    })

    // Find new users activated
    const welcomeEmailsSentPastWeek = emailsSentPastWeek.filter(
      a => a.emailId === "WelcomeToSeasons"
    )
    const usersActivatedPastWeek = uniqBy(
      welcomeEmailsSentPastWeek,
      a => a.user.id
    ).map(a => a.user.id)

    // Calculate number of invitations sent
    const invitationsSentPastWeek = emailsSentPastWeek.filter(a =>
      ["CompleteAccount", "PriorityAccess"].includes(a.emailId)
    )
    const usersInvitedButNotActivatedPastWeek = uniqBy(
      invitationsSentPastWeek,
      a => a.user.id
    )
      .map(b => b.user.id)
      .filter(c => !usersActivatedPastWeek.includes(c))

    if (
      usersActivatedPastWeek.length >
      parseInt(process.env.WEEKLY_NEW_USERS_THRESHOLD, 10)
    ) {
      return false
    }

    if (
      usersInvitedButNotActivatedPastWeek.length >
      parseInt(process.env.WEEKLY_INVITATIONS_THRESHOLD, 10)
    ) {
      return false
    }

    return true
  }

  // TODO: Write function
  haveSufficientInventoryToServiceCustomer(customer: Customer): boolean {
    return false
  }
}
