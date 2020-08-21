import * as fs from "fs"

import { GenerateParams } from "@app/modules/DataLoader/dataloader.types"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { CustomerDetail, CustomerWhereUniqueInput } from "@app/prisma"
import {
  LetterSize,
  Product,
  ProductType,
  ProductWhereInput,
  SizeWhereInput,
} from "@app/prisma/prisma.binding"
import { PrismaDataLoader, PrismaLoader } from "@app/prisma/prisma.loader"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import { flatten, get, head, intersection, uniqBy } from "lodash"
import moment from "moment"
import zipcodes from "zipcodes"

@Injectable()
export class AdmissionsService {
  serviceableStates: string[]

  // We assume that each reservation is split 50/50 between tops and bottoms.
  // That's not really accurate, but it's good enough for now.
  averageTopsPerReservation = 1.5
  averageBottomsPerReservation = 1.5

  // prisma loaders
  availableStylesForCustomerCustomerDataloader: PrismaDataLoader<{
    id: string
    detail: Pick<CustomerDetail, "topSizes" | "waistSizes">
  }>
  availableStylesForCustomerAvailableTopStylesDataloader: PrismaDataLoader<
    Product[]
  >
  availableStylesForCustomerAvailableBottomStylesDataloader: PrismaDataLoader<
    Product[]
  >

  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly prismaLoader: PrismaLoader
  ) {
    ;({ states: this.serviceableStates } = JSON.parse(
      fs.readFileSync(
        process.cwd() + "/src/modules/User/admissableStates.json",
        "utf-8"
      )
    ))
    this.generateAvailableStylesDataLoaders()
  }

  async isAdmissable(where: CustomerWhereUniqueInput): Promise<boolean> {
    const customerZipcode = await this.prisma.client
      .customer(where)
      .detail()
      .shippingAddress()
      .zipCode()
    return (
      this.zipcodeAllowed(customerZipcode) &&
      (await this.belowWeeklyNewActiveUsersOpsThreshold()) &&
      (await this.haveSufficientInventoryToServiceCustomer(where))
    )
  }

  zipcodeAllowed(zipcode: string): boolean {
    const state = zipcodes.lookup(zipcode)?.state
    return this.serviceableStates.includes(state)
  }

  async belowWeeklyNewActiveUsersOpsThreshold(): Promise<boolean> {
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

  async haveSufficientInventoryToServiceCustomer(
    where: CustomerWhereUniqueInput
  ): Promise<boolean> {
    const inventoryThreshold =
      parseInt(process.env.MIN_RESERVABLE_INVENTORY_PER_CUSTOMER, 10) || 15
    const reservableInventoryForCustomer = await this.reservableInventoryForCustomer(
      where
    )
    return reservableInventoryForCustomer > inventoryThreshold
  }

  async reservableInventoryForCustomer(
    where: CustomerWhereUniqueInput
  ): Promise<number> {
    const availableTopStyles = await this.availableStylesForCustomer(
      where,
      "Top"
    )
    const availableBottomStyles = await this.availableStylesForCustomer(
      where,
      "Bottom"
    )
    return availableTopStyles + availableBottomStyles
  }

  private async availableStylesForCustomer(
    where: CustomerWhereUniqueInput,
    productType: "Top" | "Bottom"
  ): Promise<number> {
    const customer = await this.availableStylesForCustomerCustomerDataloader.load(
      where.id as string
    )

    let sizesKey
    let stylesLoader: PrismaDataLoader<Product[]>
    switch (productType) {
      case "Top":
        sizesKey = "topSizes"
        stylesLoader = this
          .availableStylesForCustomerAvailableTopStylesDataloader
        break
      case "Bottom":
        sizesKey = "waistSizes"
        stylesLoader = this
          .availableStylesForCustomerAvailableBottomStylesDataloader
        break
      default:
        throw new Error(`Invalid product type: ${productType}`)
    }

    const preferredSizes = customer.detail[sizesKey]
    const availableStylesBySize = await stylesLoader.loadMany(preferredSizes)
    const availableStyles = flatten(availableStylesBySize as any[])

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

    return Math.max(0, numTrueAvailableStyles)
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

  private generateAvailableStylesDataLoaders() {
    // Customer Loader
    this.availableStylesForCustomerCustomerDataloader = this.prismaLoader.generateDataLoader(
      { query: "customers", info: `{id detail {topSizes waistSizes}}` }
    )

    // Available Styles loaders
    const availableStylesForCustomerAvailableStylesDataLoaderSharedParams = {
      query: "products",
      keyToDataRelationship: "ManyToMany",
      info: `
      { 
        id 
        variants {
          internalSize { 
            display
            top {
              letter
            }
          } 
          reservable
        }
      }`,
    } as GenerateParams
    this.availableStylesForCustomerAvailableTopStylesDataloader = this.prismaLoader.generateDataLoader(
      {
        ...availableStylesForCustomerAvailableStylesDataLoaderSharedParams,
        formatWhere: this.createAvailableStylesDataLoaderFormatWhereFunc(
          "Top",
          sizes => ({
            top: { letter_in: sizes as LetterSize[] },
          })
        ),
        getKeys: this.createAvailableStylesDataLoaderGetKeysFunc(
          `internalSize.top.letter`
        ),
      }
    )

    this.availableStylesForCustomerAvailableBottomStylesDataloader = this.prismaLoader.generateDataLoader(
      {
        ...availableStylesForCustomerAvailableStylesDataLoaderSharedParams,
        formatWhere: this.createAvailableStylesDataLoaderFormatWhereFunc(
          "Bottom",
          sizes => ({ display_in: (sizes as any[]).map(a => `${a}`) })
        ),
        getKeys: this.createAvailableStylesDataLoaderGetKeysFunc(
          `internalSize.display`
        ),
      }
    )
  }

  private createAvailableStylesDataLoaderFormatWhereFunc = (
    productType: ProductType,
    internalSizeWhereInputCreateFunc: (
      sizes: string[] | number[]
    ) => SizeWhereInput
  ) => {
    return sizes =>
      ({
        where: {
          AND: [
            { type: productType },
            {
              variants_some: {
                AND: [
                  {
                    internalSize: internalSizeWhereInputCreateFunc(sizes),
                  },
                  { reservable_gte: 1 },
                ],
              },
            },
          ],
        },
      } as ProductWhereInput)
  }

  private createAvailableStylesDataLoaderGetKeysFunc = (variantKey: string) => {
    return prod => {
      const keys = []
      for (const variant of prod.variants) {
        if (variant.reservable >= 1) {
          keys.push(get(variant, variantKey))
        }
      }
      return keys
    }
  }
}
