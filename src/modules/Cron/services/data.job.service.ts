import * as util from "util"

import { PhysicalProduct } from "@app/prisma"
import { AirtableService } from "@modules/Airtable"
import { AirtableData } from "@modules/Airtable/airtable.types"
import { SlackService } from "@modules/Slack/services/slack.service"
import { UtilsService } from "@modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { PrismaService } from "@prisma/prisma.service"
import { pick, xor } from "lodash"
import { format } from "prettier"

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
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly slackService: SlackService,
    private readonly utils: UtilsService
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
          text:
            "Physical products with status stored without the parent product also stored",
          paramArray: [],
        },
        {
          text:
            "Products with status offloaded without the descendant physical products all being offloaded",
          paramArray: [],
        },
        {
          text:
            "Physical Products with status Reserved that are not on an active reservation",
          paramArray: [],
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

  private checkCounts(allAirtableProductVariants, allPrismaProductVariants) {
    const countMisalignments = []
    const prismaTotalPhysicalProductMisalignment = []
    const airtableTotalPhysicalProductMisalignment = []
    for (const prismaProductVariant of allPrismaProductVariants) {
      const correspondingAirtableProductVariant = this.airtableService.getCorrespondingAirtableProductVariant(
        allAirtableProductVariants,
        prismaProductVariant
      )

      // Are all counts identical
      if (correspondingAirtableProductVariant === undefined) {
        console.log(
          "could not find product variant in airtable. sku: ",
          prismaProductVariant.sku
        )
        continue
      }
      const totalCorrect =
        prismaProductVariant.total ===
        correspondingAirtableProductVariant.model.totalCount
      const reservableCorrect =
        prismaProductVariant.reservable ===
        correspondingAirtableProductVariant.model.reservableCount
      const reservedCorrect =
        prismaProductVariant.reserved ===
        correspondingAirtableProductVariant.model.reservedCount
      const nonReservableCorrect =
        prismaProductVariant.nonReservable ===
        correspondingAirtableProductVariant.model.nonReservableCount
      const storedCorrect =
        prismaProductVariant.stored ===
        correspondingAirtableProductVariant.model.storedCount
      const offloadedCorrect =
        prismaProductVariant.offloaded ===
        correspondingAirtableProductVariant.model.offloadedCount
      if (
        !totalCorrect ||
        !reservableCorrect ||
        !reservedCorrect ||
        !nonReservableCorrect ||
        !storedCorrect ||
        !offloadedCorrect
      ) {
        countMisalignments.push({
          sku: prismaProductVariant.sku,
          prismaCounts: pick(prismaProductVariant, [
            "total",
            "reserved",
            "reservable",
            "nonReservable",
            "stored",
            "offloaded",
          ]),
          airtableCounts: {
            total: correspondingAirtableProductVariant.model.totalCount,
            reserved: correspondingAirtableProductVariant.model.reservedCount,
            reservable:
              correspondingAirtableProductVariant.model.reservableCount,
            nonReservable:
              correspondingAirtableProductVariant.model.nonReservableCount,
            stored: correspondingAirtableProductVariant.model.storedCount,
            offloaded: correspondingAirtableProductVariant.model.offloadedCount,
          },
        })
      }

      // Does prisma have the number of physical products it should? ibid, Airtable?
      if (
        prismaProductVariant.physicalProducts.length !==
        prismaProductVariant.total
      ) {
        prismaTotalPhysicalProductMisalignment.push({
          sku: prismaProductVariant.sku,
          totalCount: prismaProductVariant.total,
          attachedPhysicalProducts:
            prismaProductVariant.physicalProducts.length,
        })
      }
      const noPhysicalProductsAndMisalignment =
        !correspondingAirtableProductVariant.fields["Physical Products"] &&
        correspondingAirtableProductVariant.fields["Total Count"] !== 0
      const physicalProductsAndMisalignment =
        !!correspondingAirtableProductVariant.fields["Physical Products"] &&
        correspondingAirtableProductVariant.fields["Physical Products"]
          .length !== correspondingAirtableProductVariant.fields["Total Count"]
      if (
        noPhysicalProductsAndMisalignment ||
        physicalProductsAndMisalignment
      ) {
        airtableTotalPhysicalProductMisalignment.push({
          sku: correspondingAirtableProductVariant.fields.SKU,
          totalCount: correspondingAirtableProductVariant.fields["Total Count"],
          attachedPhysicalProducts:
            correspondingAirtableProductVariant.fields["Total Count"].length,
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
    for (const physProd of allPhysicalProducts) {
      switch (physProd.inventoryStatus) {
        case "Stored":
          // code block
          break
        case "Reserved":
          // code block
          break
        case "Offloaded":
          // code block
          break
        default:
        // code block
      }
    }
    const storedPhysProds = allPhysicalProducts.filter(
      a => a.inventoryStatus === "Stored"
    )
    const offloadedPhysProds = allPhysicalProducts.filter(
      a => a.inventoryStatus === "Offloaded"
    )
    const reservedPhysProds = allPhysicalProducts.filter(
      a => a.inventoryStatus === "Reserved"
    )
    const reservable

    //
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
}
