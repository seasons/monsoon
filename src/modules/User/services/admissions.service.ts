import * as fs from "fs"

import { ApplicationType } from "@app/decorators/application.decorator"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { CustomerStatus, CustomerWhereUniqueInput, Product } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import { head, intersection, uniqBy } from "lodash"
import moment from "moment"
import zipcodes from "zipcodes"

export interface TriageFuncResult {
  pass: boolean
  detail: any
}

export interface ZipcodeAllowedResult extends TriageFuncResult {
  detail: {
    zipcode: string
    state: string
    serviceableStates: string[]
    allAccessEnabled: boolean
  }
}
export interface ReservableInventoryForCustomerResultDetail {
  availableBottomStyles: Product[]
  availableTopStyles: Product[]
}

export interface HaveSufficientInventoryToServiceCustomerResult
  extends TriageFuncResult {
  detail: ReservableInventoryForCustomerResultDetail & {
    inventoryThreshold: number
  }
}

interface AdmissableStates {
  allAccessEnabled: { true: string[]; false: string[] }
}

@Injectable()
export class AdmissionsService {
  serviceableStates: AdmissableStates

  // We assume that each reservation is split 50/50 between tops and bottoms.
  // That's not really accurate, but it's good enough for now.
  averageTopsPerReservation = 1.5
  averageBottomsPerReservation = 1.5

  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService
  ) {
    ;({ states: this.serviceableStates } = this.utils.parseJSONFile(
      "src/modules/User/admissableStates"
    ))
  }

  async hasSupportedPlatform(
    where: CustomerWhereUniqueInput,
    application: ApplicationType
  ): Promise<TriageFuncResult> {
    const customer = await this.prisma.binding.query.customer(
      {
        where,
      },
      `{
        id
        detail {
          phoneOS
        }
      }`
    )

    const phoneOS =
      application === "harvest" ? "iOS" : customer?.detail?.phoneOS

    return {
      pass: phoneOS === "iOS",
      detail: customer.detail,
    }
  }

  zipcodeAllowed(zipcode: string): ZipcodeAllowedResult {
    const state = zipcodes.lookup(zipcode)?.state
    const allServiceableStates = [
      ...this.serviceableStates.allAccessEnabled.true,
      ...this.serviceableStates.allAccessEnabled.false,
    ]
    const pass = allServiceableStates.includes(state)
    const detail = {
      zipcode,
      state,
      serviceableStates: allServiceableStates,
      allAccessEnabled: this.serviceableStates.allAccessEnabled.true.includes(
        state
      ),
    }
    return { pass, detail }
  }

  async belowWeeklyNewActiveUsersOpsThreshold(): Promise<TriageFuncResult> {
    let pass = true
    let detail = {}

    const emailsSent = await this.prisma.binding.query.emailReceipts(
      {
        where: {
          emailId_in: ["WelcomeToSeasons", "CompleteAccount", "PriorityAccess"],
        },
        orderBy: "createdAt_DESC",
      },
      `{
        emailId
        createdAt
        user {
          id
        }
      }`
    )
    const now = moment()
    const emailsSentPastWeek = emailsSent.filter(a => {
      const numDaysSinceEmailSent = now.diff(moment(a.createdAt), "days")
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

    const weeklyNewUsersThreshold = parseInt(
      process.env.WEEKLY_NEW_USERS_THRESHOLD,
      10
    )
    const weeklyInvitationsThreshold = parseInt(
      process.env.WEEKLY_INVITATIONS_THRESHOLD,
      10
    )
    detail = {
      usersActivatedPastWeek: usersActivatedPastWeek.length,
      invitationsSentPastWeek: invitationsSentPastWeek.length,
      weeklyNewUsersThreshold,
      weeklyInvitationsThreshold,
    }

    if (
      usersActivatedPastWeek.length > weeklyNewUsersThreshold ||
      usersInvitedButNotActivatedPastWeek.length > weeklyInvitationsThreshold
    ) {
      pass = false
    }

    return { pass, detail }
  }

  async getAvailableStyles(
    where: CustomerWhereUniqueInput
  ): Promise<Product[]> {
    const {
      detail: { availableTopStyles, availableBottomStyles },
    } = await this.haveSufficientInventoryToServiceCustomer(where)
    return [...availableBottomStyles, ...availableTopStyles]
  }

  async haveSufficientInventoryToServiceCustomer(
    where: CustomerWhereUniqueInput
  ): Promise<HaveSufficientInventoryToServiceCustomerResult> {
    const inventoryThreshold =
      parseInt(process.env.MIN_RESERVABLE_INVENTORY_PER_CUSTOMER, 10) || 15
    const {
      reservableStyles,
      detail: reservableInventoryForCustomerDetail,
    } = await this.reservableInventoryForCustomer(where)
    const pass = reservableStyles > inventoryThreshold

    return {
      pass,
      detail: { ...reservableInventoryForCustomerDetail, inventoryThreshold },
    }
  }

  async reservableInventoryForCustomer(
    where: CustomerWhereUniqueInput
  ): Promise<{
    reservableStyles: number
    detail: ReservableInventoryForCustomerResultDetail
  }> {
    const {
      reservableStyles: availableTopStyles,
      adjustedReservableStyles: numAvailableAdjustedTopStyles,
    } = await this.availableStylesForCustomer(where, "Top")
    const {
      reservableStyles: availableBottomStyles,
      adjustedReservableStyles: numAvailableAdjustedBottomStyles,
    } = await this.availableStylesForCustomer(where, "Bottom")

    return {
      reservableStyles:
        numAvailableAdjustedTopStyles + numAvailableAdjustedBottomStyles,
      detail: { availableBottomStyles, availableTopStyles },
    }
  }

  // is a customer with the given status able to be triaged?
  isTriageable(status: CustomerStatus) {
    return ["Created", "Invited", "Waitlisted"].includes(status)
  }

  private async availableStylesForCustomer(
    where: CustomerWhereUniqueInput,
    productType: "Top" | "Bottom"
  ): Promise<{
    reservableStyles: Product[]
    adjustedReservableStyles: number
  }> {
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
    switch (productType) {
      case "Top":
        sizesKey = "topSizes"
        break
      case "Bottom":
        sizesKey = "waistSizes"
        break
      default:
        throw new Error(`Invalid product type: ${productType}`)
    }

    const preferredSizes = customer.detail[sizesKey]
    const availableStyles = (await this.prisma.binding.query.products(
      {
        where: {
          AND: [
            { type: productType },
            {
              variants_some: {
                AND: [
                  {
                    displayShort_in: preferredSizes.map(size =>
                      size.toString()
                    ),
                  },
                  { reservable_gte: 1 },
                ],
              },
            },
          ],
        },
      },
      // Need to query certain fields for the emails sent based on this data
      `{
        id
        type
        name
        retailPrice
        images {
          url
        }
        variants {
          displayShort
        }
        brand {
          name
        }
    }`
    )) as Product[]

    // Find the competing users. Note that we assume all active customers without an active
    // reservation may be a competing user, regardless of how long it's been since their last reservation
    // return was processed. This is because more than 98% of users reserve within 1 week of being able to do so.
    const potentiallyCompetingUsers = [
      ...(await this.pausedCustomersResumingThisWeek()),
      ...(await this.activeCustomersWithoutActiveReservation()),
    ]
    const competingUsers = potentiallyCompetingUsers.filter(a => {
      if (a.id === customer.id) {
        return false
      }
      return intersection(a.detail[sizesKey], preferredSizes).length > 0
    })

    const numStylesPerReservation =
      productType === "Top"
        ? this.averageTopsPerReservation
        : this.averageBottomsPerReservation
    const numStylesForCompetingUsers =
      numStylesPerReservation * competingUsers.length
    const numTrueAvailableStyles =
      availableStyles.length - numStylesForCompetingUsers

    return {
      reservableStyles: availableStyles,
      adjustedReservableStyles: Math.max(0, numTrueAvailableStyles),
    }
  }

  private async pausedCustomersResumingThisWeek() {
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
            resumeDate
          }
        }
    }`
    )
    const pausedCustomersResumingThisWeek = pausedCustomers.filter(a => {
      const pauseRequests = a.membership?.pauseRequests || []
      if (pauseRequests.length === 0) {
        return false
      }

      const latestPauseRequest = head(
        pauseRequests.sort((a, b) =>
          this.utils.dateSort(a.createdAt, b.createdAt)
        )
      )
      return this.utils.isLessThanXDaysFromNow(
        latestPauseRequest?.resumeDate as string,
        7
      )
    })

    return pausedCustomersResumingThisWeek
  }

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
      reservations {
        createdAt
      }
    }`
    )
  }
}
