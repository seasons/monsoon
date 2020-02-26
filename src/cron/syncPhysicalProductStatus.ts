import { getAllPhysicalProducts } from "../airtable/utils"
import {
  prisma,
  ProductVariant,
  InventoryStatus as PrismaInventoryStatus,
} from "../prisma"
import {
  updateProductVariantCounts,
  AirtableProductVariantCounts,
} from "../airtable/updateProductVariantCounts"
import { AirtableInventoryStatus } from "../airtable/updatePhysicalProduct"
import { airtableToPrismaInventoryStatus } from "../utils"
import * as Sentry from "@sentry/node"

const shouldReportErrorsToSentry = process.env.NODE_ENV === "production"

if (shouldReportErrorsToSentry) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  })
}

export async function syncPhysicalProductStatus() {
  // Get relevant data for airtable, setup containers to hold return data
  const updatedPhysicalProducts = []
  const updatedProductVariants = []
  const errors = []
  const physicalProductsInAirtableButNotPrisma = []
  const allAirtablePhysicalProducts = await getAllPhysicalProducts()

  // Update relevant products
  for (const airtablePhysicalProduct of allAirtablePhysicalProducts) {
    // Wrap it in a try/catch so individual sync errors don't stop the whole job
    try {
      if (shouldReportErrorsToSentry) {
        Sentry.configureScope(scope => {
          scope.setExtra(
            "physicalProductSUID",
            airtablePhysicalProduct.fields.SUID.text
          )
        })
      }

      const prismaPhysicalProduct = await prisma.physicalProduct({
        seasonsUID: airtablePhysicalProduct.fields.SUID.text,
      })

      if (airtablePhysicalProduct.id === "recEkF6wQCImLehjW") {
        console.log("yo")
      }
      if (!!prismaPhysicalProduct) {
        const newStatusOnAirtable =
          airtablePhysicalProduct.fields["Inventory Status"]
        const currentStatusOnPrisma = prismaPhysicalProduct.inventoryStatus

        // If the status has changed, then update prisma and airtable accordingly
        if (
          physicalProductStatusChanged(
            newStatusOnAirtable,
            currentStatusOnPrisma
          )
        ) {
          // Pause a second, to avoid hitting the 5 requests/sec airtable rate limit
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Get the associated ProductVariantID, and ProductVariant from prisma
          const prismaProductVariantID = await prisma
            .physicalProduct({ id: prismaPhysicalProduct.id })
            .productVariant()
            .id()
          const prismaProductVariant = await prisma.productVariant({
            id: prismaProductVariantID,
          })

          // Update the counts on the corresponding product variant in prisma
          await prisma.updateProductVariant({
            data: getUpdatedCounts(
              prismaProductVariant,
              currentStatusOnPrisma,
              newStatusOnAirtable,
              "prisma"
            ) as prismaProductVariantCounts,
            where: {
              id: prismaProductVariantID,
            },
          })

          // Update the status of the corresponding physical product in prisma
          await prisma.updatePhysicalProduct({
            data: {
              inventoryStatus: airtableToPrismaInventoryStatus(
                newStatusOnAirtable
              ),
            },
            where: { id: prismaPhysicalProduct.id },
          })

          // Update the counts on the corresponding product variant in airtable
          await updateProductVariantCounts(
            airtablePhysicalProduct.fields["Product Variant"][0],
            getUpdatedCounts(
              prismaProductVariant,
              currentStatusOnPrisma,
              newStatusOnAirtable,
              "airtable"
            ) as AirtableProductVariantCounts
          )

          // Store updated ids for reporting
          updatedPhysicalProducts.push(prismaPhysicalProduct.seasonsUID)
          updatedProductVariants.push(prismaProductVariant.sku)
        }
      } else {
        physicalProductsInAirtableButNotPrisma.push(
          airtablePhysicalProduct.fields.SUID
        )
      }
    } catch (error) {
      console.log(airtablePhysicalProduct)
      console.log(error)
      errors.push(error)
      if (shouldReportErrorsToSentry) {
        Sentry.captureException(error)
      }
    }
  }

  // Remove physicalProductSUID from the sentry scope so it doesn't cloud
  // any errors thrown later
  if (shouldReportErrorsToSentry) {
    Sentry.configureScope(scope => {
      scope.setExtra("physicalProductSUID", "")
    })
  }

  return {
    updatedPhysicalProducts,
    updatedProductVariants,
    physicalProductsInAirtableButNotPrisma,
    errors,
  }
}

// *****************************************************************************

type prismaProductVariantCounts = Pick<
  ProductVariant,
  "reservable" | "nonReservable" | "reserved"
>
type productVariantCounts =
  | prismaProductVariantCounts
  | AirtableProductVariantCounts

function physicalProductStatusChanged(
  newStatusOnAirtable: AirtableInventoryStatus,
  currentStatusOnPrisma: PrismaInventoryStatus
): boolean {
  return (
    airtableToPrismaInventoryStatus(newStatusOnAirtable) !==
    currentStatusOnPrisma
  )
}

function getUpdatedCounts(
  prismaProductVariant: ProductVariant,
  currentStatusOnPrisma: PrismaInventoryStatus,
  newStatusOnAirtable: AirtableInventoryStatus,
  format: "prisma" | "airtable"
): productVariantCounts {
  const prismaCounts = {} as prismaProductVariantCounts
  const airtableCounts = {} as AirtableProductVariantCounts

  // Decrement the count for whichever status we are moving away from
  switch (currentStatusOnPrisma) {
    case "NonReservable":
      prismaCounts.nonReservable = prismaProductVariant.nonReservable - 1
      airtableCounts["Non-Reservable Count"] = prismaCounts.nonReservable
      break
    case "Reserved":
      prismaCounts.reserved = prismaProductVariant.reserved - 1
      airtableCounts["Reserved Count"] = prismaCounts.reserved
      break
    case "Reservable":
      prismaCounts.reservable = prismaProductVariant.reservable - 1
      airtableCounts["Reservable Count"] = prismaCounts.reservable
      break
  }

  // Increment the count for whichever status we are switching on to
  switch (newStatusOnAirtable) {
    case "Non Reservable":
      prismaCounts.nonReservable = prismaProductVariant.nonReservable + 1
      airtableCounts["Non-Reservable Count"] = prismaCounts.nonReservable
      break
    case "Reserved":
      prismaCounts.reserved = prismaProductVariant.reserved + 1
      airtableCounts["Reserved Count"] = prismaCounts.reserved
      break
    case "Reservable":
      prismaCounts.reservable = prismaProductVariant.reservable + 1
      airtableCounts["Reservable Count"] = prismaCounts.reservable
      break
  }

  // Get the formatting right
  let retVal
  if (format === "prisma") {
    retVal = prismaCounts
  }
  if (format === "airtable") {
    retVal = airtableCounts
  }

  return retVal
}
