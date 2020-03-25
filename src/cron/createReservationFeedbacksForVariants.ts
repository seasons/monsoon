import {
  prisma,
  Product,
  ProductVariant,
  User,
} from "../prisma"

const MULTIPLE_CHOICE = "MultipleChoice"

export const createReservationFeedbacksForVariants = async (
  productVariants: ProductVariant[],
  user: User
) => {
  const variantInfos = await Promise.all(
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
      create: variantInfos.map(variantInfo => ({
        isCompleted: false,
        questions: {
          create: [
            {
              question: `How many times did you wear this ${variantInfo.name}?`,
              options: { set: ["More than 6 times", "3-5 times", "1-2 times", "0 times"] },
              type: MULTIPLE_CHOICE,
            },
            {
              question: `Would you buy it at retail for $${variantInfo.retailPrice}?`,
              options: { set: ["Would buy at a discount", "Buy below retail", "Buy at retail", "Would only rent"] },
              type: MULTIPLE_CHOICE,
            },
            {
              question: `Did it fit as expected?`,
              options: { set: ["Fit too big", "Fit true to size", "Ran small", "Didn’t fit at all"] },
              type: MULTIPLE_CHOICE,
            },
          ]
        },
        variant: { connect: { id: variantInfo.id } }
      })),
    },
    user: {
      connect: {
        id: user.id
      }
    },
  })
}