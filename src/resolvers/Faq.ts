import { Context } from "../utils"
import { getCustomerFromContext, getUserFromContext } from "../auth/utils"

export const Faq = async (parent, args, ctx: Context) => {
  // TODO: Remove before merging. Currently using to create mock data
  // const user = await getUserFromContext(ctx)
  // const items = [
  //   "ck7z06yy80ne60724ex76we5n",
  //   "ck7z027rb0eka072417wdwsjn",
  //   "ck7z06h5w0mfx0724bektpq65",
  // ]
  // const variants = await Promise.all(
  //   items.map(async item => {
  //     // const variant = this.prisma.client.productVariant({ id: item })
  //     return {
  //       id: await ctx.prisma.productVariant({ id: item }).id(),
  //       name: await ctx.prisma.productVariant({ id: item }).product().name(),
  //       retailPrice: await ctx.prisma.productVariant({ id: item }).product().retailPrice(),
  //     }
  //   })
  // )
  // console.log("VARIANTS:", variants)
  // const reservationFeedback = await ctx.prisma.createReservationFeedback({
  //   feedbacks: {
  //     create: variants.map(variant => ({
  //       isCompleted: false,
  //       questions: {
  //         create: [
  //           {
  //             question: `How many times did you wear this ${variant.name}?`,
  //             options: { set: ["More than 6 times", "3-5 times", "1-2 times", "0 times"] },
  //             type: "MultipleChoice",
  //           },
  //           {
  //             question: `Would you buy it at retail for $${variant.retailPrice}?`,
  //             options: { set: ["Would buy at a discount", "Buy below retail", "Buy at retail", "Would only rent"] },
  //             type: "MultipleChoice",
  //           },
  //           {
  //             question: `Did it fit as expected?`,
  //             options: { set: ["Fit too big", "Fit true to size", "Ran small", "Didn’t fit at all"] },
  //             type: "MultipleChoice",
  //           },
  //         ]
  //       },
  //       variant: { connect: { id: variant.id } }
  //     })),
  //   },
  //   user: {
  //     connect: {
  //       id: user.id
  //     }
  //   },
  // })
  // console.log("MADE FEEDBACK:", reservationFeedback)
  return {
    sections: [
      {
        title: "Need to return your items?",
        subsections: [
          {
            title: "Ready for something new?",
            text:
              "We're happy to exchange for a different size pending availability. Pack it up, attach the pre-paid shipping label and drop it off at your closest UPS or UPS pickup point.",
          },
          {
            title: "Received the wrong item?",
            text:
              "Sorry about that! Pack it up, attach the pre-paid shipping label and send it back. We'll get you the right one.",
          },
          {
            title: "Did something not fit?",
            text:
              "We're happy to help you find something that fits. Pack it up, send it back, and we'll swap it out.",
          },
          {
            title: "Have feedback or thoughts?",
            text: "Contact us below. We'd love to hear from you.",
          },
        ],
      },
    ],
  }
}
