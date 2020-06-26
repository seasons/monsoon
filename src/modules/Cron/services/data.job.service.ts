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
          paramArray: [],
          printDetailFunc: a => {
            console.log(util.inspect(a, { depth: null }))
          },
        },
        {
          text:
            "Number of product variants with total != reserved + reservable + nonreservable + stored + offloaded",
          paramArray: [],
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
    return {
      countMisalignments,
      prismaTotalPhysicalProductMisalignment,
      airtableTotalPhysicalProductMisalignment,
    }
  }

  private checkMisalignmentsBetweenProdVarCountsAndPhysProdStatuses(
    allPrismaProductVariants: any[],
    allAirtableProductVariants: AirtableData,
    allAirtablePhysicalProducts: AirtableData
  ) {
    const prismaMisalignments = allPrismaProductVariants
      .filter(a => {
        const physicalProductsWithStatusReserved = a.physicalProducts.filter(
          b => b.inventoryStatus === "Reserved"
        )
        const physicalProductsWithStatusReservable = a.physicalProducts.filter(
          b => b.inventoryStatus === "Reservable"
        )
        const physicalProductsWithStatusNonReservable = a.physicalProducts.filter(
          b => b.inventoryStatus === "NonReservable"
        )
        const physicalProductsWithStatusOffloaded = a.physicalProducts.filter(
          b => b.inventoryStatus === "Offloaded"
        )
        const physicalProductsWithStatusStored = a.physicalProducts.filter(
          b => b.inventoryStatus === "Stored"
        )
        return (
          a.reservable !== physicalProductsWithStatusReservable.length ||
          a.reserved !== physicalProductsWithStatusReserved.length ||
          a.nonReservable !== physicalProductsWithStatusNonReservable.length ||
          a.stored !== physicalProductsWithStatusStored.length ||
          a.offloaded !== physicalProductsWithStatusOffloaded.length
        )
      })
      .map(c => ({
        sku: c.sku,
        createdAt: c.createdAt,
        counts: {
          total: c.total,
          reservable: c.reservable,
          reserved: c.reserved,
          nonReservable: c.nonReservable,
          stored: c.stored,
          offloaded: c.offloaded,
        },
        updatedAt: c.updatedAt,
        physicalProducts: c.physicalProducts.map(d => ({
          suid: d.seasonsUID,
          status: d.inventoryStatus,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })),
      }))

    const airtableMisalignments = allAirtableProductVariants
      .filter(a => {
        const correspondingAirtablePhysicalProducts = this.getAttachedAirtablePhysicalProducts(
          allAirtablePhysicalProducts,
          a
        )
        const physicalProductsWithStatusReserved = correspondingAirtablePhysicalProducts.filter(
          c => c.fields["Inventory Status"] === "Reserved"
        )
        const physicalProductsWithStatusReservable = correspondingAirtablePhysicalProducts.filter(
          c => c.fields["Inventory Status"] === "Reservable"
        )
        const physicalProductsWithStatusNonReservable = correspondingAirtablePhysicalProducts.filter(
          c => c.fields["Inventory Status"] === "Non Reservable"
        )
        return (
          !!a.fields.SKU &&
          (a.model.reservableCount !==
            physicalProductsWithStatusReservable.length ||
            a.model.reservedCount !==
              physicalProductsWithStatusReserved.length ||
            a.model.nonReservableCount !==
              physicalProductsWithStatusNonReservable.length)
        )
      })
      .map(d => ({
        sku: d.fields.SKU,
        counts: {
          total: d.fields["Total Count"],
          reservable: d.model.reservableCount,
          reserved: d.model.reservedCount,
          nonReservable: d.model.nonReservableCount,
        },
        physicalProducts: this.getAttachedAirtablePhysicalProducts(
          allAirtablePhysicalProducts,
          d
        ).map(e => ({
          SUID: e.fields.SUID.text,
          status: e.fields["Inventory Status"],
        })),
      }))
    return [prismaMisalignments, airtableMisalignments]
  }

  private checkPhysicalProductStatuses(
    allPrismaPhysicalProducts,
    allAirtablePhysicalProducts
  ) {
    const mismatchingStatuses = []
    const physicalProductsOnPrismaButNotAirtable = []
    for (const prismaPhysicalProduct of allPrismaPhysicalProducts) {
      const correspondingAirtablePhysicalProduct = this.airtableService.getCorrespondingAirtablePhysicalProduct(
        allAirtablePhysicalProducts,
        prismaPhysicalProduct
      )
      if (!correspondingAirtablePhysicalProduct) {
        physicalProductsOnPrismaButNotAirtable.push(
          prismaPhysicalProduct.seasonsUID
        )
        continue
      } else {
        if (
          this.airtableService.airtableToPrismaInventoryStatus(
            correspondingAirtablePhysicalProduct.model.inventoryStatus
          ) !== prismaPhysicalProduct.inventoryStatus
        ) {
          mismatchingStatuses.push({
            seasonsUID: prismaPhysicalProduct.seasonsUID,
            airtableInventoryStatus:
              correspondingAirtablePhysicalProduct.model.inventoryStatus,
            prismaInventoryStatus: prismaPhysicalProduct.inventoryStatus,
          })
        }
      }
    }
    return { mismatchingStatuses, physicalProductsOnPrismaButNotAirtable }
  }

  private checkReservations(
    allPrismaReservations,
    allAirtableReservations,
    allAirtablePhysicalProducts
  ) {
    const misalignedSUIDsOnReservations = []
    const misalignedStatusOnReservations = []
    const reservationsWithMoreThanThreeProducts = []
    const allPrismaReservationNumbers = allPrismaReservations.map(
      resy => resy.reservationNumber
    )
    const allAirtableReservationNumbers = allAirtableReservations.map(
      resy => resy.fields.ID
    )
    const reservationsInPrismaButNotAirtable = allPrismaReservationNumbers.filter(
      prismaResyNumber =>
        !allAirtableReservationNumbers.includes(prismaResyNumber)
    )
    const reservationsInAirtableButNotPrisma = allAirtableReservationNumbers.filter(
      airtableResyNumber =>
        !allPrismaReservationNumbers.includes(airtableResyNumber)
    )
    for (const prismaResy of allPrismaReservations) {
      if (
        reservationsInPrismaButNotAirtable.includes(
          prismaResy.reservationNumber
        )
      ) {
        continue
      }

      const correspondingAirtableReservation = allAirtableReservations.find(
        airtableResy => airtableResy.fields.ID === prismaResy.reservationNumber
      )

      // Check SUID match
      const prismaPhysicalProductSUIDs = prismaResy.products.map(
        prod => prod.seasonsUID
      )
      const airtablePhysicalProductSUIDs = correspondingAirtableReservation.fields.Items.map(
        airtablePhysicalProductRecordID =>
          allAirtablePhysicalProducts.find(
            airtablePhysProd =>
              airtablePhysProd.id === airtablePhysicalProductRecordID
          )
      ).map(airtablePhysProdRecord => airtablePhysProdRecord.fields.SUID.text)
      if (
        xor(prismaPhysicalProductSUIDs, airtablePhysicalProductSUIDs).length !==
        0
      ) {
        misalignedSUIDsOnReservations.push({
          reservationNumber: prismaResy.reservationNumber,
          airtableSUIDs: airtablePhysicalProductSUIDs,
          prismaSUIDs: prismaPhysicalProductSUIDs,
        })
      }

      // Check status match
      if (
        prismaResy.status !==
        correspondingAirtableReservation.fields.Status.replace(" ", "")
      ) {
        misalignedStatusOnReservations.push({
          reservationNumber: prismaResy.reservationNumber,
          prismaStatus: prismaResy.status,
          airtableStatus: correspondingAirtableReservation.fields.Status,
        })
      }

      // Check item count
      if (prismaPhysicalProductSUIDs.length > 3) {
        reservationsWithMoreThanThreeProducts.push({
          reservationNumber: prismaResy.reservationNumber,
        })
      }
    }
    return {
      misalignedSUIDsOnReservations,
      misalignedStatusOnReservations,
      reservationsWithMoreThanThreeProducts,
      reservationsInAirtableButNotPrisma,
      reservationsInPrismaButNotAirtable,
    }
  }

  private checkSUIDs(
    allPrismaProductVariants,
    allAirtableProductVariants,
    allAirtablePhysicalProducts
  ) {
    const prismaSUIDToSKUMismatches = []
    for (const prismaProductVariant of allPrismaProductVariants) {
      for (const physProd of prismaProductVariant.physicalProducts) {
        if (!physProd.seasonsUID.startsWith(prismaProductVariant.sku)) {
          prismaSUIDToSKUMismatches.push({
            productVariantSKU: prismaProductVariant.sku,
            physicalProductSUID: physProd.seasonsUID,
          })
        }
      }
    }
    const airtableSUIDToSKUMismatches = []
    for (const airtableProductVariant of allAirtableProductVariants) {
      // If it has no physical products, skip it.
      if (!airtableProductVariant.fields["Physical Products"]) {
        continue
      }

      for (const airtablePhysProdRecordID of airtableProductVariant.fields[
        "Physical Products"
      ]) {
        const airtablePhysProdRecord = allAirtablePhysicalProducts.find(
          rec => rec.id == airtablePhysProdRecordID
        )
        if (
          !airtablePhysProdRecord.fields.SUID.text.startsWith(
            airtableProductVariant.fields.SKU
          )
        ) {
          airtableSUIDToSKUMismatches.push({
            productVariantSKU: airtableProductVariant.fields.SKU,
            physicalProductSUID: airtablePhysProdRecord.fields.SUID.text,
          })
        }
      }
    }
    return { prismaSUIDToSKUMismatches, airtableSUIDToSKUMismatches }
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
  private getAttachedAirtablePhysicalProducts(
    allAirtablePhysicalProducts,
    airtableProductVariant
  ) {
    if (!airtableProductVariant.fields.SKU) return []

    return allAirtablePhysicalProducts.filter(a =>
      airtableProductVariant.model?.physicalProducts?.includes(a.id)
    )
  }

  private getPrismaAirtableProductVariantSKUMismatches(
    allAirtableProductVariants,
    allPrismaProductVariants,
    productVariantsInPrismaButNotAirtable
  ) {
    const productVariantSKUMismatches = []
    const errors = []
    for (const prismaProductVariant of allPrismaProductVariants) {
      try {
        // If its not in airtable, skip it
        if (
          productVariantsInPrismaButNotAirtable.includes(
            prismaProductVariant.sku
          )
        ) {
          continue
        }

        // Check if the skus match
        const correspondingAirtableProductVariant = this.airtableService.getCorrespondingAirtableProductVariant(
          allAirtableProductVariants,
          prismaProductVariant
        )
        if (
          prismaProductVariant.sku !==
          correspondingAirtableProductVariant.fields.SKU
        ) {
          productVariantSKUMismatches.push({
            prismaID: prismaProductVariant.id,
            prismaSKU: prismaProductVariant.sku,
            airtableRecordID: correspondingAirtableProductVariant.id,
            airtableSKU: correspondingAirtableProductVariant.fields.SKU,
          })
        }
      } catch (err) {
        console.log(err)
        errors.push(err)
        continue
      }
    }
    return { productVariantSKUMismatches, errors }
  }

  private async getProdVarsWithImpossibleCounts(allPrismaProductVariants) {
    return allPrismaProductVariants
      .filter(
        a =>
          a.total !==
          a.reserved + a.reservable + a.nonReservable + a.stored + a.offloaded
      )
      .map(a =>
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
  }

  private checkSequenceNumberSync(
    allAirtablePhysicalProducts: AirtableData,
    allPrismaPhysicalProducts: PhysicalProduct[]
  ) {
    const mismatchingSequenceNumbers = []
    for (const prismaPP of allPrismaPhysicalProducts) {
      const correspondingAirtablePP = this.airtableService.getCorrespondingAirtablePhysicalProduct(
        allAirtablePhysicalProducts,
        prismaPP
      )
      if (
        prismaPP.sequenceNumber !== correspondingAirtablePP.model.sequenceNumber
      ) {
        mismatchingSequenceNumbers.push({
          seasonsUID: prismaPP.seasonsUID,
          prismaSequenceNumber: prismaPP.sequenceNumber,
          airtableSequenceNumber: correspondingAirtablePP.model.sequenceNumber,
        })
      }
    }
    return mismatchingSequenceNumbers
  }
}
