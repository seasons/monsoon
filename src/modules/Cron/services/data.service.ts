import * as util from "util"

import { AirtableService } from "@modules/Airtable"
import { AirtableData } from "@modules/Airtable/airtable.types"
import { SlackService } from "@modules/Slack/services/slack.service"
import { UtilsService } from "@modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { PrismaService } from "@prisma/prisma.service"
import { identity, pick, xor } from "lodash"

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

  // @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_9AM)
  async airtableToPrismaHealthCheck() {
    let message = { channel: process.env.SLACK_DEV_CHANNEL_ID, text: "'" }
    try {
      const [
        productsInPrismaButNotAirtable,
        productsInAirtableButNotPrisma,
        physicalProductsInPrismaButNotAirtable,
        physicalProductsInAirtableButNotPrisma,
        productVariantsInPrismaButNotAirtable,
        productVariantsInAirtableButNotPrisma,
        productVariantSKUMismatches,
        prismaSUIDToSKUMismatches,
        airtableSUIDToSKUMismatches,
        countMisalignments,
        prismaTotalPhysicalProductMisalignment,
        airtableTotalPhysicalProductMisalignment,
        prismaCountToStatusMisalignments,
        airtableCountToStatusMisalignments,
        prismaProdVarsWithImpossibleCounts,
        mismatchingStatuses,
        reservationsInPrismaButNotAirtable,
        reservationsInAirtableButNotPrisma,
        misalignedSUIDsOnReservations,
        misalignedStatusOnReservations,
        reservationsWithMoreThanThreeProducts,
        errors,
      ] = await this.checkAll()
      message = {
        ...message,
        text: "",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:newspaper: *Airtable-Prisma Products Parity Health Check* :newspaper:`,
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
            title:
              "Do products, physical products, and product variants align in number?",
            datapoints: [
              {
                name: "Products on Prisma but not Airtable",
                number: productsInPrismaButNotAirtable.length,
                shouldFlagNum: true,
              },
              {
                name: "Products on Airtable but not Prisma",
                number: productsInAirtableButNotPrisma.length,
              },
              {
                name: "Physical Products on Prisma but not Airtable",
                number: physicalProductsInPrismaButNotAirtable.length,
                shouldFlagNum: true,
              },
              {
                name: "Physical Products on Airtable but not Prisma",
                number: physicalProductsInAirtableButNotPrisma.length,
              },
              {
                name: "Product Variants on Prisma but not Airtable",
                number: productVariantsInPrismaButNotAirtable.length,
                shouldFlagNum: true,
              },
              {
                name: "Product Variants on Airtable but not Prisma",
                number: productVariantsInAirtableButNotPrisma.length,
              },
            ],
          }),
          ...this.createReportSection({
            title: "Do product variant SKUs match?",
            datapoints: [
              {
                name: "Mismatched product variant SKUs",
                number: productVariantSKUMismatches.length,
                shouldFlagNum: true,
              },
            ],
          }),
          ...this.createReportSection({
            title: "Are SUIDs correct?",
            datapoints: [
              {
                name: "Mismatched SUID/SKU combos on Prisma",
                number: prismaSUIDToSKUMismatches.length,
                shouldFlagNum: true,
              },
              {
                name: "Mismatched SUID/SKU combos on Airtable",
                number: airtableSUIDToSKUMismatches.length,
                shouldFlagNum: true,
              },
            ],
          }),
          ...this.createReportSection({
            title: "Are the counts aligned?",
            datapoints: [
              {
                name:
                  "Prisma: Number of Product Variants with incorrect number of physical products attached",
                number: prismaTotalPhysicalProductMisalignment.length,
                shouldFlagNum: true,
              },
              {
                name:
                  "Airtable: Number of Product Variants with incorrect number of physical products attached",
                number: airtableTotalPhysicalProductMisalignment.length,
                shouldFlagNum: true,
              },
              {
                name: "Mismatched counts",
                number: countMisalignments.length,
                shouldFlagNum: true,
              },
              {
                name:
                  "Prisma: Number of product variants with mismatching counts/statuses",
                number: prismaCountToStatusMisalignments.length,
                shouldFlagNum: true,
              },
              {
                name:
                  "Airtable: Number of product variants with mismatching counts/statuses",
                number: airtableCountToStatusMisalignments.length,
                shouldFlagNum: true,
              },
              {
                name:
                  "Prisma: Number of product variants with impossible counts",
                number: prismaProdVarsWithImpossibleCounts.length,
                shouldFlagNum: true,
              },
            ],
          }),
          ...this.createReportSection({
            title: "Are physical product inventory statuses aligned?",
            datapoints: [
              {
                name:
                  "Number of physical products with mismatching inventory statuses",
                number: mismatchingStatuses.length,
                shouldFlagNum: true,
              },
            ],
          }),
          ...this.createReportSection({
            title: "Are reservations aligned?",
            datapoints: [
              {
                name: "Reservations in prisma but not airtable",
                number: reservationsInPrismaButNotAirtable.length,
                shouldFlagNum: true,
              },
              {
                name: "Reservations in airtable but not prisma",
                number: reservationsInAirtableButNotPrisma.length,
                shouldFlagNum: true,
              },
              {
                name: "Reservations with mismatching products",
                number: misalignedSUIDsOnReservations.length,
                shouldFlagNum: true,
              },
              {
                name: "Reservations with mismatching statuses",
                number: misalignedStatusOnReservations.length,
                shouldFlagNum: true,
              },
              {
                name: "Reservations with more than 3 products",
                number: reservationsWithMoreThanThreeProducts.length,
                shouldFlagNum: true,
              },
            ],
          }),
          ...this.createReportSection({
            title: "Other",
            datapoints: [
              {
                name: "Errors",
                number: errors.length,
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
                ` work with the health check script locally using \`yarn healthCheck:production\`` +
                `, printing more details as needed`,
            },
          },
        ],
      } as any
    } catch (err) {
      message = {
        ...message,
        text:
          `Error while running airtable/prisma health check. Please debug it ` +
          `locally using \`monsoon hc --pe production --ae production\`\n${err}`,
      } as any
    }

    await this.slackService.postMessage(message)
  }

  async checkAll(withDetails = false) {
    const allAirtableProductVariants = await this.airtableService.getAllProductVariants()
    const allAirtablePhysicalProducts = await this.airtableService.getAllPhysicalProducts()
    const allAirtableProducts = await this.airtableService.getAllProducts()
    const allAirtableReservations = await this.airtableService.getAllReservations()
    const allPrismaProductVariants = await this.prisma.binding.query.productVariants(
      {},
      `{
            id
            product {
                slug
            }
            physicalProducts {
                seasonsUID
                inventoryStatus
                createdAt
                updatedAt
            }
            sku
            total
            reservable
            reserved
            nonReservable
            stored
            offloaded
            internalSize {
              top {
                letter
              }
              bottom {
                type
                value
              }
              productType
            }
            createdAt
            updatedAt
        }`
    )
    const allPrismaPhysicalProducts = await this.prisma.client.physicalProducts()
    const allPrismaProducts = await this.prisma.client.products()
    const allPrismaReservations = await this.prisma.binding.query.reservations(
      {},
      `
      {
          id
          reservationNumber
          products {
              seasonsUID
          }
          status
      }
      `
    )

    let errors = []

    /* Do we have any products on prisma but not airtable? Vice versa? */
    const allPrismaProductSlugs = allPrismaProducts.map(prod => prod.slug)
    const allAirtableProductSlugs = allAirtableProducts.map(
      prod => prod.fields.Slug
    )
    const productsInAirtableButNotPrisma = allAirtableProductSlugs.filter(
      slug => !allPrismaProductSlugs.includes(slug)
    )
    const productsInPrismaButNotAirtable = allPrismaProductSlugs.filter(
      slug => !allAirtableProductSlugs.includes(slug)
    )

    /* Do we have any physical products in airtable but not prisma? Vice versa */
    const allPrismaPhysicalProductSUIDs = allPrismaPhysicalProducts.map(
      physProd => physProd.seasonsUID
    )
    const allAirtablePhysicalProductSUIDs = allAirtablePhysicalProducts.map(
      physProd => physProd.fields.SUID.text
    )
    const physicalProductsInAirtableButNotPrisma = allAirtablePhysicalProductSUIDs.filter(
      suid => !allPrismaPhysicalProductSUIDs.includes(suid)
    )
    const physicalProductsInPrismaButNotAirtable = allPrismaPhysicalProductSUIDs.filter(
      suid => !allAirtablePhysicalProductSUIDs.includes(suid)
    )

    /* Do we have any product variants in airtable but not prisma? Vice versa? */
    const allPrismaProductVariantSKUs = allPrismaProductVariants.map(
      prodVar => prodVar.sku
    )
    const allAirtableProductVariantSKUs = allAirtableProductVariants.map(
      prodVar => prodVar.fields.SKU
    )
    const productVariantsInAirtableButNotPrisma = allAirtableProductVariantSKUs.filter(
      sku => !allPrismaProductVariantSKUs.includes(sku)
    )
    const productVariantsInPrismaButNotAirtable = allPrismaProductVariantSKUs.filter(
      sku => !allAirtableProductVariantSKUs.includes(sku)
    )

    /* Are the skus matching between product variants on prisma and airtable?
    (Only considers those product variants in both prisma and airtable)
    */
    const {
      productVariantSKUMismatches,
      errors: prismaAirtableSKUCheckErrors,
    } = this.getPrismaAirtableProductVariantSKUMismatches(
      allAirtableProductVariants,
      allPrismaProductVariants,
      productVariantsInPrismaButNotAirtable
    )
    errors = [...errors, ...prismaAirtableSKUCheckErrors]

    /* Check SUIDs. Are they correct on prisma? Are the correct on airtable? */
    const {
      prismaSUIDToSKUMismatches,
      airtableSUIDToSKUMismatches,
    } = this.checkSUIDs(
      allPrismaProductVariants,
      allAirtableProductVariants,
      allAirtablePhysicalProducts
    )

    /* Are the product variant counts matching between prisma and airtable? */
    const {
      countMisalignments,
      prismaTotalPhysicalProductMisalignment,
      airtableTotalPhysicalProductMisalignment,
    } = this.checkCounts(allAirtableProductVariants, allPrismaProductVariants)
    const [
      prismaCountToStatusMisalignments,
      airtableCountToStatusMisalignments,
    ] = this.checkMisalignmentsBetweenProdVarCountsAndPhysProdStatuses(
      allPrismaProductVariants,
      allAirtableProductVariants,
      allAirtablePhysicalProducts
    )
    const prismaProdVarsWithImpossibleCounts = await this.getProdVarsWithImpossibleCounts(
      allPrismaProductVariants
    )

    /* Are the physical product statuses matching between prisma and airtable? */
    const {
      mismatchingStatuses,
      physicalProductsOnPrismaButNotAirtable,
    } = this.checkPhysicalProductStatuses(
      allPrismaPhysicalProducts,
      allAirtablePhysicalProducts
    )

    /* Are the reservations aligned? */
    const {
      misalignedSUIDsOnReservations,
      misalignedStatusOnReservations,
      reservationsWithMoreThanThreeProducts,
      reservationsInAirtableButNotPrisma,
      reservationsInPrismaButNotAirtable,
    } = this.checkReservations(
      allPrismaReservations,
      allAirtableReservations,
      allAirtablePhysicalProducts
    )

    /* REPORT */
    this.printReportLines(
      [
        { text: `/*********** report ***********/` },
        {
          text: `do products, physical products, and product variants align in number?`,
        },
        {
          text: "products on prisma but not airtable",
          paramArray: productsInPrismaButNotAirtable,
        },
        {
          text: "products on airtable but not prisma",
          paramArray: productsInAirtableButNotPrisma,
        },
        {
          text: "physical products on prisma but not airtable",
          paramArray: physicalProductsInPrismaButNotAirtable,
        },
        {
          text: "physical products on airtable but not prisma",
          paramArray: physicalProductsInAirtableButNotPrisma,
        },
        {
          text: "product variants on prisma but not airtable",
          paramArray: productVariantsInPrismaButNotAirtable,
        },
        {
          text: "product variants on airtable but not prisma",
          paramArray: productVariantsInAirtableButNotPrisma,
          withGutter: true,
        },
        {
          text: "do product variant skus match on prisma and airtable",
        },
        {
          text: "mismatched product variant skus between prisma/airtable",
          paramArray: productVariantSKUMismatches,
          withGutter: true,
        },
        {
          text: `are suids correct on prisma and airtable?`,
        },
        {
          text: "mismatched suid/sku combos on prisma",
          paramArray: prismaSUIDToSKUMismatches,
        },
        {
          text: "mismatched suid/sku combos on airtable",
          paramArray: airtableSUIDToSKUMismatches,
          withGutter: true,
        },
        {
          text: "are the counts the same on prisma and airtable?",
        },
        {
          text: "mismatched counts",
          paramArray: countMisalignments,
        },
        {
          text:
            "prisma: number of product variants with incorrect number of physical products attached",
          paramArray: prismaTotalPhysicalProductMisalignment,
        },
        {
          text:
            "airtable: number of product variants with incorrect number of physical products attached",
          paramArray: airtableTotalPhysicalProductMisalignment,
        },
        {
          text:
            "prisma: number of product variants with a count profile that doesn't match the statuses of the attached physical products",
          paramArray: prismaCountToStatusMisalignments,
          printDetailFunc: a => {
            console.log(util.inspect(a, { depth: null }))
          },
        },
        {
          text:
            "airtable: number of product variants with a count profile that doesn't match the statuses of the attached physical products",
          paramArray: airtableCountToStatusMisalignments,
          printDetailFunc: a => {
            console.log(
              util.inspect(
                a.map(a => a.sku),
                { depth: null }
              )
            )
          },
        },
        {
          text:
            "prisma: number of product variants with total != reserved + reservable + nonreservable + stored + offloaded",
          paramArray: prismaProdVarsWithImpossibleCounts,
          withGutter: true,
        },
        {
          text: "are the physical product statuses aligned?",
        },
        {
          text:
            "number of physical products with mismatching inventory statuses",
          paramArray: mismatchingStatuses,
          withGutter: true,
        },
        {
          text: "are the reservations aligned?",
        },
        {
          text: "reservations in prisma but not airtable",
          paramArray: reservationsInPrismaButNotAirtable,
        },
        {
          text: "reservations in airtable but not prisma",
          paramArray: reservationsInAirtableButNotPrisma,
        },
        {
          text: "reservations with mismatching products",
          paramArray: misalignedSUIDsOnReservations,
        },
        {
          text: "reservations with mismatching statuses",
          paramArray: misalignedStatusOnReservations,
        },
        {
          text: "reservations with more than 3 products",
          paramArray: reservationsWithMoreThanThreeProducts,
        },
        {
          text: "errors",
          paramArray: errors,
        },
      ],
      withDetails
    )

    return [
      productsInPrismaButNotAirtable,
      productsInAirtableButNotPrisma,
      physicalProductsInPrismaButNotAirtable,
      physicalProductsInAirtableButNotPrisma,
      productVariantsInPrismaButNotAirtable,
      productVariantsInAirtableButNotPrisma,
      productVariantSKUMismatches,
      prismaSUIDToSKUMismatches,
      airtableSUIDToSKUMismatches,
      countMisalignments,
      prismaTotalPhysicalProductMisalignment,
      airtableTotalPhysicalProductMisalignment,
      prismaCountToStatusMisalignments,
      airtableCountToStatusMisalignments,
      prismaProdVarsWithImpossibleCounts,
      mismatchingStatuses,
      reservationsInPrismaButNotAirtable,
      reservationsInAirtableButNotPrisma,
      misalignedSUIDsOnReservations,
      misalignedStatusOnReservations,
      reservationsWithMoreThanThreeProducts,
      errors,
    ]
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
      .map(c =>
        this.utils.Identity({
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
          physicalProducts: c.physicalProducts.map(d =>
            this.utils.Identity({
              suid: d.seasonsUID,
              status: d.inventoryStatus,
              createdAt: d.createdAt,
              updatedAt: d.updatedAt,
            })
          ),
        })
      )

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
      .map(d =>
        this.utils.Identity({
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
          ).map(e =>
            this.utils.Identity({
              SUID: e.fields.SUID.text,
              status: e.fields["Inventory Status"],
            })
          ),
        })
      )
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
        fields: datapoints.map(p =>
          this.utils.Identity({
            type: "mrkdwn",
            text: `*${p.name}*\n${this.flagIfNeeded(
              p.number,
              !!p.shouldFlagNum
            )}`,
          })
        ),
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
}
