import { getAllPhysicalProducts } from "../airtable/utils"
import {
  prisma,
  Product,
  ProductVariant,
  InventoryStatus as PrismaInventoryStatus,
} from "../prisma"
import { airtableToPrismaInventoryStatus } from "../utils"
import { physicalProductStatusChanged } from "./syncPhysicalProductStatus"
import * as Sentry from "@sentry/node"

const shouldReportErrorsToSentry = process.env.NODE_ENV === "production"

export const createReservationFeedbacks = async () => {
  // Get relevant data for airtable, setup containers to hold return data
  const errors = []
  const returnedProductVariants = []
  const allAirtablePhysicalProducts = await getAllPhysicalProducts()

  // Update relevant products
  for (const airtablePhysicalProduct of allAirtablePhysicalProducts) {
    // Wrap it in a try/catch so individual sync errors don't stop the whole job
    try {
      const prismaPhysicalProduct = await prisma.physicalProduct({
        seasonsUID: airtablePhysicalProduct.fields.SUID.text,
      })

      if (!!prismaPhysicalProduct) {
        const newStatusOnAirtable =
          airtablePhysicalProduct.fields["Inventory Status"]
        const currentStatusOnPrisma = prismaPhysicalProduct.inventoryStatus

        // If the status has changed and it is now reservable, that means that
        // the user just returned this item
        if (
          physicalProductStatusChanged(newStatusOnAirtable, currentStatusOnPrisma) &&
          airtableToPrismaInventoryStatus(newStatusOnAirtable) === "Reservable"
        ) {
          // Get the associated ProductVariantID, and ProductVariant from prisma
          const prismaProductVariantID = await prisma
            .physicalProduct({ id: prismaPhysicalProduct.id })
            .productVariant()
            .id()
          const prismaProductVariant = await prisma.productVariant({
            id: prismaProductVariantID,
          })
          returnedProductVariants.push(prismaProductVariant)
        }
      }
    } catch (error) {
      console.log(error)
      errors.push(error)
      if (shouldReportErrorsToSentry) {
        Sentry.captureException(error)
      }
    }
  }

  await createReservationFeedbacksForVariants(returnedProductVariants)
}

const createReservationFeedbacksForVariants = async (productVariants: ProductVariant[]) => {
  // const user = await getUserFromContext(ctx)
  // How to get the users who returned each respective product variant?
  const user = null
  const variants = await Promise.all(
    productVariants.map(async variant => {
      const product: Product = await prisma.product({ id: variant.productID })
      return {
        id: variant.id,
        name: product.name,
        retailPrice: product.retailPrice,
      }
    })
  )
  await prisma.createReservationFeedback({
    feedbacks: {
      create: variants.map(variant => ({
        isCompleted: false,
        questions: {
          create: [
            {
              question: `How many times did you wear this ${variant.name}?`,
              options: { set: ["More than 6 times", "3-5 times", "1-2 times", "0 times"] },
              type: "MultipleChoice",
            },
            {
              question: `Would you buy it at retail for $${variant.retailPrice}?`,
              options: { set: ["Would buy at a discount", "Buy below retail", "Buy at retail", "Would only rent"] },
              type: "MultipleChoice",
            },
            {
              question: `Did it fit as expected?`,
              options: { set: ["Fit too big", "Fit true to size", "Ran small", "Didn’t fit at all"] },
              type: "MultipleChoice",
            },
          ]
        },
        variant: { connect: { id: variant.id } }
      })),
    },
    user: {
      connect: {
        id: user.id
      }
    },
  })
}