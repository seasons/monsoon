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
    private readonly slackService: SlackService // private readonly physicalProductUtils: PhysicalProductUtilsService
  ) {}

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_9AM)
  async airtableToPrismaHealthCheck() {
    let message = { channel: process.env.SLACK_DEV_CHANNEL_ID, text: "'" }
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
                number: [].length,
                shouldFlagNum: true,
              },
              {
                name:
                  "Number of product variants with incorrect number of physical products attached",
                number: [].length,
              },
              {
                name:
                  "Number of product variants with a count profile that doesn't match the attached physical product statuses",
                number: [].length,
                shouldFlagNum: true,
              },
              {
                name:
                  "Number of product variants with total != reserved + reservable + nonreservable + stored + offloaded",
                number: [].length,
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
    /* REPORT */
    this.printReportLines(
      [
        { text: `/*********** report ***********/` },
        {
          text: `Product Variant + Physical Product Health`,
        },
        {
          text: "Mismatched SUID/SKU combos",
          paramArray: await this.getSUIDtoSKUMismatches(),
        },
        {
          text:
            "Number of product variants with incorrect number of physical products attached",
          paramArray: await this.getProductVariantsWithIncorrectNumberOfPhysicalProductsAttached(),
        },
        {
          text:
            "Number of product variants with a count profile that doesn't match the attached physical product statuses",
          paramArray: await this.getProdVarsWithCountsThatDontMatchPhysProdStatuses(),
          printDetailFunc: a => {
            console.log(util.inspect(a, { depth: null }))
          },
        },
        {
          text:
            "Number of product variants with total != reserved + reservable + nonreservable + stored + offloaded",
          paramArray: await this.getProdVarsWithImpossibleCounts(),
          withGutter: true,
        },
        {
          text: "Physical products with an erroneous inventoryStatus situation",
          paramArray: await this.checkPhysicalProductStatuses(),
          printDetailFunc: a => {
            console.log(util.inspect(a, { depth: null }))
          },
        },
      ],
      withDetails
    )
  }

  private async getSUIDtoSKUMismatches() {
    const SUIDtoSKUMismatches = []
    const allProdVars = await this.prisma.binding.query.productVariants(
      { where: {} },
      `{
        id
        sku
        physicalProducts {
          seasonsUID
        }
      }`
    )
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

  private async getProductVariantsWithIncorrectNumberOfPhysicalProductsAttached() {
    const cases = []
    const allProdVars = await this.prisma.binding.query.productVariants(
      { where: {} },
      `{
        id
        sku
        physicalProducts {
          seasonsUID
        }
        total
      }`
    )
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

  private async getProdVarsWithCountsThatDontMatchPhysProdStatuses() {
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

  private async checkPhysicalProductStatuses() {
    const allPhysicalProducts = await this.prisma.client.physicalProducts()

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
      switch (physProd.inventoryStatus) {
        case "Stored":
          thisCase = await this.checkStoredPhysicalProduct(physProd, thisCase)
          break
        case "Reserved":
          if (!activeReservationWithPhysProd) {
            thisCase.issues.push(
              "Has status reserved but is not on an active reservation"
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
  private async getProdVarsWithImpossibleCounts() {
    const allPrismaProdVars = await this.prisma.client.productVariants()
    const cases = allPrismaProdVars.filter(
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
