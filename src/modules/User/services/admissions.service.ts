import * as fs from "fs"

import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { CustomerWhereUniqueInput, LetterSize, ProductType } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import { head, intersection, uniqBy } from "lodash"
import moment from "moment"
import zipcodes from "zipcodes"

@Injectable()
export class AdmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService
  ) {}

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

  // TODO: Test function. Consider reworking invitiations part
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

  // TODO: Test Function
  async haveSufficientInventoryToServiceCustomer(
    where: CustomerWhereUniqueInput
  ): Promise<boolean> {
    return (
      (await this.reservableInventoryForCustomer(where)) >
      parseInt(process.env.MIN_RESERVABLE_INVENTORY_PER_CUSTOMER, 10)
    )
  }

  async reservableInventoryForCustomer(
    where: CustomerWhereUniqueInput
  ): Promise<number> {
    return (
      (await this.availableStylesForCustomer(where, "Top")) +
      (await this.availableStylesForCustomer(where, "Bottom"))
    )
  }

  private async availableStylesForCustomer(
    where: CustomerWhereUniqueInput,
    productType: "Top" | "Bottom"
  ): Promise<number> {
    const customer = await this.prisma.binding.query.customer(
      {
        where,
      },
      `{
        id
        detail {
          topSizes
          waistSizes
        }
      }`
    )

    let sizesKey
    let internalSizeWhereInputCreateFunc
    switch (productType) {
      case "Top":
        sizesKey = "topSizes"
        internalSizeWhereInputCreateFunc = sizes => {
          top: {
            letter_in: sizes
          }
        }
        break
      case "Bottom":
        sizesKey = "waistSizes"
        internalSizeWhereInputCreateFunc = sizes => {
          bottom: {
            waist_in: sizes
          }
        }
        break
      default:
        throw new Error(`Invalid product type: ${productType}`)
    }

    const preferredSizes = customer.detail[sizesKey]
    const avaiableStyles = await this.prisma.binding.query.products({
      where: {
        AND: [
          { type: productType },
          {
            variants_some: {
              AND: [
                {
                  internalSize: internalSizeWhereInputCreateFunc(
                    preferredSizes
                  ),
                },
                { reservable_gte: 1 },
              ],
            },
          },
        ],
      },
    })

    // Find the competing users
    const potentiallyCompetingUsers = [
      ...(await this.pausedUsersResumingThisWeek()),
      ...(await this.activeCustomersWithoutActiveReservation()),
    ]
    const competingUsers = potentiallyCompetingUsers.filter(
      a => !!intersection(a.detail[sizesKey], preferredSizes)
    )

    const trueAvailableStyles =
      avaiableStyles.length - 1.5 * competingUsers.length

    return trueAvailableStyles
  }
  // TODO: Test this logic
  private async pausedUsersResumingThisWeek() {
    const pausedCustomers = await this.prisma.binding.query.customers(
      {
        where: { status: "Paused" },
      },
      `{
        id
        detail {
          topSizes
          waistSizes
        }
        membership {
          pauseRequests {
            createdAt
            resumeData
          }
        }
    }`
    )
    const pausedCustomersResumingThisWeek = pausedCustomers.filter(a => {
      const latestPauseRequest = head(
        a.membership.pauseRequests.sort((a, b) => {
          return moment(a.createdAt).isAfter(moment(b.createdAt)) ? -1 : 1
        })
      )
      return this.utils.isLessThanXDaysFromNow(
        latestPauseRequest.resumeDate as string,
        7
      )
    })

    return pausedCustomersResumingThisWeek
  }

  // TODO: Test this logic
  private async activeCustomersWithoutActiveReservation() {
    return await this.prisma.binding.query.customers(
      {
        where: {
          AND: [
            { status: "Active" },
            { reservations_every: { status_in: ["Completed", "Cancelled"] } },
          ],
        },
      },
      `{
      id
      detail {
        topSizes
        waistSizes
      }
    }`
    )
  }
}
