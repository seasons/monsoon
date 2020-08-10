import * as util from "util"

import { PhysicalProductUtilsService } from "@app/modules/Product"
import { SlackService } from "@modules/Slack/services/slack.service"
import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { PrismaService } from "@prisma/prisma.service"
import { head, pick } from "lodash"

interface DataPoint {
  name: string
  number: number
  shouldFlagNum?: boolean
}

interface ReportLine {
  text: string
  paramArray?: any[] | null
  withDetails?: boolean
  printDetailFunc?: any
  withGutter?: boolean
}

@Injectable()
export class DataScheduledJobs {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slackService: SlackService
  ) {}

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_9AM)
  async prismaHealthCheck() {
    let message = { channel: process.env.SLACK_DEV_CHANNEL_ID, text: "'" }
    const {
      SUIDToSKUMismatches,
      prodVarsWithIncorrectNumberOfPhysProdsAttached,
      prodVarsWIthCountsThatDontMatchPhysProdStatuses,
      prodVarsWithImpossibleCounts,
      physProdsWithErroneousInventoryStatuses,
    } = await this.checkAll()

    try {
      message = {
        ...message,
        text: "",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:newspaper: *Prisma Data Health Report* :newspaper:`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `*${new Date().toLocaleDateString()}*`,
              },
            ],
          },
          ...this.createReportSection({
            title: "Product Variant + Physical Product Health?",
            datapoints: [
              {
                name: "Mismatched SUID/SKU combos",
                number: SUIDToSKUMismatches.length,
                shouldFlagNum: true,
              },
              {
                name:
                  "Number of product variants with incorrect number of physical products attached",
                number: prodVarsWithIncorrectNumberOfPhysProdsAttached.length,
                shouldFlagNum: true,
              },
              {
                name:
                  "Number of product variants with a count profile that doesn't match the attached physical product statuses",
                number: prodVarsWIthCountsThatDontMatchPhysProdStatuses.length,
                shouldFlagNum: true,
              },
              {
                name:
                  "Number of product variants with total != reserved + reservable + nonreservable + stored + offloaded",
                number: prodVarsWithImpossibleCounts.length,
                shouldFlagNum: true,
              },
              {
                name:
                  "Number of physical products with inventory statuses that don't match their surrounding data",
                number: physProdsWithErroneousInventoryStatuses.length,
                shouldFlagNum: true,
              },
            ],
          }),
          ...this.createReportSection({
            title: "Other",
            datapoints: [
              {
                name: "Errors",
                number: [].length,
              },
            ],
            divider: false,
          }),
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                `Note: \`Highlighted numbers\` need attention. For more details` +
                ` work with the health check script locally using \`monsoon hc --pe production --withDetails\``,
            },
          },
        ],
      } as any
    } catch (err) {
      message = {
        ...message,
        text:
          `Error while running prisma data health check. Please debug it ` +
          `locally using \`monsoon hc --pe production\`\n${err}`,
      } as any
    }

    await this.slackService.postMessage(message)
  }

  async checkAll(withDetails = false) {
    const allProdVars = await this.prisma.binding.query.productVariants(
      { where: {} },
      `{
        id
        sku
        physicalProducts {
          seasonsUID
          inventoryStatus
        }
        total
        reservable
        reserved
        nonReservable
        offloaded
        stored
      }`
    )
    const allPhysicalProducts = await this.prisma.binding.query.physicalProducts(
      { where: {} },
      `{
        id
        seasonsUID
        inventoryStatus
        warehouseLocation {
          id
          barcode
        }
      }`
    )
    const SUIDToSKUMismatches = await this.getSUIDtoSKUMismatches(allProdVars)
    const prodVarsWithIncorrectNumberOfPhysProdsAttached = await this.getProductVariantsWithIncorrectNumberOfPhysicalProductsAttached(
      allProdVars
    )
    const prodVarsWIthCountsThatDontMatchPhysProdStatuses = await this.getProdVarsWithCountsThatDontMatchPhysProdStatuses(
      allProdVars
    )
    const prodVarsWithImpossibleCounts = await this.getProdVarsWithImpossibleCounts(
      allProdVars
    )
    const physProdsWithErroneousInventoryStatuses = await this.checkPhysicalProductStatuses(
      allPhysicalProducts
    )
    /* REPORT */
    this.printReportLines(
      [
        { text: `/*********** report ***********/` },
        {
          text: `Product Variant + Physical Product Health`,
        },
        {
          text: "Mismatched SUID/SKU combos",
          paramArray: SUIDToSKUMismatches,
        },
        {
          text:
            "Number of product variants with incorrect number of physical products attached",
          paramArray: prodVarsWithIncorrectNumberOfPhysProdsAttached,
        },
        {
          text:
            "Number of product variants with a count profile that doesn't match the attached physical product statuses",
          paramArray: prodVarsWIthCountsThatDontMatchPhysProdStatuses,
          printDetailFunc: a => {
            console.log(util.inspect(a, { depth: null }))
          },
        },
        {
          text:
            "Number of product variants with total != reserved + reservable + nonreservable + stored + offloaded",
          paramArray: prodVarsWithImpossibleCounts,
          withGutter: true,
        },
        {
          text: "Physical products with an erroneous inventoryStatus situation",
          paramArray: physProdsWithErroneousInventoryStatuses,
          printDetailFunc: a => {
            console.log(util.inspect(a, { depth: null }))
          },
        },
      ],
      withDetails
    )

    return {
      SUIDToSKUMismatches,
      prodVarsWithIncorrectNumberOfPhysProdsAttached,
      prodVarsWIthCountsThatDontMatchPhysProdStatuses,
      prodVarsWithImpossibleCounts,
      physProdsWithErroneousInventoryStatuses,
    }
  }

  private async getSUIDtoSKUMismatches(allProdVars) {
    const SUIDtoSKUMismatches = []
    for (const prodVar of allProdVars) {
      for (const physProd of prodVar.physicalProducts) {
        if (!physProd.seasonsUID.startsWith(prodVar.sku)) {
          SUIDtoSKUMismatches.push({
            productVariantSKU: prodVar.sku,
            physicalProductSUID: physProd.seasonsUID,
          })
        }
      }
    }

    return SUIDtoSKUMismatches
  }

  private async getProductVariantsWithIncorrectNumberOfPhysicalProductsAttached(
    allProdVars
  ) {
    const cases = []
    for (const prodVar of allProdVars) {
      if (prodVar.total !== prodVar.physicalProducts.length) {
        cases.push({
          sku: prodVar.sku,
          total: prodVar.total,
          attachedPhysicalProducts: prodVar.physicalProducts.map(a => ({
            seasonsUID: a.seasonsUID,
          })),
        })
      }
    }

    return cases
  }

  private async getProdVarsWithCountsThatDontMatchPhysProdStatuses(
    allProdVars
  ) {
    const cases = allProdVars.filter(a => {
      const physProds = a.physicalProducts
      const reservedPhysProds = physProds.filter(
        b => b.inventoryStatus === "Reserved"
      )
      const reservablePhysProds = physProds.filter(
        b => b.inventoryStatus === "Reservable"
      )
      const nonReservablePhysProds = physProds.filter(
        b => b.inventoryStatus === "NonReservable"
      )
      const offloadedPhysProds = physProds.filter(
        b => b.inventoryStatus === "Offloaded"
      )
      const storedPhysProds = physProds.filter(
        b => b.inventoryStatus === "Stored"
      )
      return (
        a.reservable !== reservablePhysProds.length ||
        a.reserved !== reservedPhysProds.length ||
        a.nonReservable !== nonReservablePhysProds.length ||
        a.stored !== storedPhysProds.length ||
        a.offloaded !== offloadedPhysProds.length
      )
    })
    const formattedCases = cases.map(c => ({
      sku: c.sku,
      counts: {
        ...pick(c, [
          "total",
          "reservable",
          "reserved",
          "nonReservable",
          "offloaded",
          "stored",
        ]),
      },
      physicalProducts: c.physicalProducts.map(d =>
        pick(d, ["seasonsUID", "inventoryStatus"])
      ),
    }))

    return formattedCases
  }

  private async checkPhysicalProductStatuses(allPhysicalProducts) {
    /*
      Consider a given physical product. 
      
      If its inventoryStatus is stored, the following should be true:
          -> its parent product should be stored
          -> its sibling physical products should all either be "stored" or "reserved"
      If either of those conditions are not true, add it to the cases list. 

      If its inventoryStatus is offloaded, there's no other conditions to check

      If its inventoryStatus is reserved, it should be on an active reservation. If it's not, 
      add it to the cases list. 

      If its inventoryStatus is reservable or nonReservable, it should not be on an active reservation. 
      If it is, add it to the cases list. 

      Also check:
        If it has a warehouse location, it should be reservable. If it doesn't, it should not be reservable. 
    */
    const cases = []
    for (const physProd of allPhysicalProducts) {
      let thisCase = {
        ...pick(physProd, ["inventoryStatus", "seasonsUID"]),
        issues: [],
        siblingsWithIssues: [],
      } as any
      const activeReservationWithPhysProd = head(
        await this.prisma.client.reservations({
          where: {
            AND: [
              { products_some: { seasonsUID: physProd.seasonsUID } },
              { status_not_in: ["Completed", "Cancelled"] },
            ],
          },
        })
      )

      // Check specific inventory statuses
      switch (physProd.inventoryStatus) {
        case "Stored":
          thisCase = await this.checkStoredPhysicalProduct(physProd, thisCase)
          break
        case "Reserved":
          if (!activeReservationWithPhysProd) {
            // check if the customer held onto it from their last completed reservation
            const lastCompletedReservation = head(
              await this.prisma.binding.query.reservations(
                {
                  where: {
                    AND: [
                      { products_some: { seasonsUID: physProd.seasonsUID } },
                      { status: "Completed" },
                    ],
                  },
                  orderBy: "createdAt_DESC",
                },
                `{
                reservationNumber
                status
                returnedPackage {
                 items {
                   seasonsUID
                 } 
                }
              }`
              )
            ) as any
            const returnedItems =
              lastCompletedReservation?.returnedPackage?.items?.map(
                a => a.seasonsUID
              ) || []
            if (returnedItems.includes(physProd.inventoryStatus))
              thisCase.issues.push(
                `Has status reserved but is not on an active reservation. It was returned last on reservation ${lastCompletedReservation.reservationNumber}`
              )
          }
          break
        case "Reservable":
        case "NonReservable":
          if (!!activeReservationWithPhysProd) {
            thisCase = {
              ...thisCase,
              activeReservation: pick(activeReservationWithPhysProd, [
                "reservationNumber",
                "status",
              ]),
            }
            thisCase.issues.push(
              `Has status ${physProd.inventoryStatus} but is on an active reservation`
            )
          }
          break
        default:
          break
      }

      // Check warehouse location rules
      if (!!physProd.warehouseLocation) {
        // If it does have a warehouse location, it should either be Reservable, Stored or be on a Queued Reservation
        const isReservableOrStored = ["Reservable", "Stored"].includes(
          physProd.inventoryStatus
        )
        const isOnQueuedReservation =
          activeReservationWithPhysProd?.status === "Queued"
        if (!(isReservableOrStored || isOnQueuedReservation)) {
          thisCase.issues.push(
            `Has warehouse location ${
              physProd.warehouseLocation.barcode
            }. It should either be reservable, stored, or be on a queued reservation. Active Reservation: ${
              activeReservationWithPhysProd || "none"
            }`
          )
        }
      } else {
        // If it doesn't have a warehouse location, it shouldn't be reservable
        if (physProd.inventoryStatus === "Reservable") {
          thisCase.issues.push(`Has no warehouse location, but is reservable.`)
        }
      }
      if (thisCase.issues.length !== 0) {
        cases.push(thisCase)
      }
    }

    return cases
  }

  private async checkStoredPhysicalProduct(physProd, thisCase) {
    let thisCaseClone = Object.assign({}, thisCase)

    const parentProduct = head(
      await this.prisma.client.products({
        where: {
          variants_some: {
            physicalProducts_some: { seasonsUID: physProd.seasonsUID },
          },
        },
      })
    )
    if (parentProduct.status !== "Stored") {
      thisCaseClone = {
        ...thisCaseClone,
        parentProductStatus: parentProduct.status,
      }
      thisCaseClone.issues.push(
        "If a physical product is stored, its parent product should be stored"
      )
    }

    const parentProductVariant = head(
      await this.prisma.binding.query.productVariants(
        {
          where: {
            physicalProducts_some: { seasonsUID: physProd.seasonsUID },
          },
        },
        `{
        physicalProducts {
          seasonsUID
          inventoryStatus
        }
      }`
      )
    ) as any
    const siblingPhysicalProducts = parentProductVariant.physicalProducts.filter(
      a => a.seasonsUID !== physProd.seasonsUID
    )
    for (const siblingPhysProd of siblingPhysicalProducts) {
      if (!["Stored", "Reserved"].includes(siblingPhysProd.inventoryStatus)) {
        thisCaseClone.siblingsWithIssues.push({
          ...pick(siblingPhysProd, ["inventoryStatus", "seasonsUID"]),
        })
        thisCaseClone.issues.push(
          `Sibling ${siblingPhysProd.seasonsUID} has erroneous status ${siblingPhysProd.inventoryStatus}`
        )
      }
    }

    return thisCaseClone
  }
  private async getProdVarsWithImpossibleCounts(allProdVars) {
    const cases = allProdVars.filter(
      a =>
        a.total !==
        a.reserved + a.reservable + a.nonReservable + a.stored + a.offloaded
    )
    const formattedCases = cases.map(a =>
      pick(a, [
        "sku",
        "total",
        "reserved",
        "reservable",
        "nonReservable",
        "stored",
        "offloaded",
      ])
    )
    return formattedCases
  }
  private createReportSection({
    title,
    datapoints,
    divider = true,
  }: {
    title: string
    datapoints: DataPoint[]
    divider?: boolean
  }) {
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${title.toUpperCase()}*`,
        },
      },
    ]

    if (datapoints.length >= 1) {
      blocks.push({
        type: "section",
        fields: datapoints.map(p => ({
          type: "mrkdwn",
          text: `*${p.name}*\n${this.flagIfNeeded(
            p.number,
            !!p.shouldFlagNum
          )}`,
        })),
      } as any)
    }

    if (divider) {
      blocks.push({
        type: "divider",
      } as any)
    }

    return blocks
  }

  private printReportLines(
    lines: Omit<ReportLine, "withDetails">[],
    withDetails: boolean
  ) {
    for (const line of lines) {
      this.printSingleReportLine({ ...line, withDetails })
    }
  }
  private printSingleReportLine({
    text,
    paramArray = null,
    withDetails = false,
    printDetailFunc = null,
    withGutter = false,
  }: ReportLine) {
    if (!paramArray) {
      console.log(text.toUpperCase())
      withGutter && console.log("")
    } else {
      console.log(`--- ${text.toLowerCase()}: ${paramArray.length}`)
      this.printIfRequestedAndNonZero(withDetails, paramArray, printDetailFunc)
      withGutter && console.log("")
    }
  }
  private flagIfNeeded = (num, shouldFlag) =>
    shouldFlag && num > 0 ? `\`${num}\`` : `${num}`

  private printIfRequestedAndNonZero = (
    withDetails,
    paramArray,
    printFunc = null
  ) => {
    if (withDetails && paramArray?.length > 0) {
      !!printFunc ? printFunc(paramArray) : console.log(paramArray)
    }
  }
}
