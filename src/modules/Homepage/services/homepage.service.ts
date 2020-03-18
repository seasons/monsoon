import { Injectable } from "@nestjs/common"
import { PrismaClientService } from "../../../prisma/client.service"
import { DBService } from "../../../prisma/db.service"

export enum SectionTitle {
  FeaturedCollection = "Featured collection",
  JustAdded = "Just added",
  RecentlyViewed = "Recently viewed",
  Designers = "Designers",
}

@Injectable()
export class HomepageService {
  constructor(
    private readonly db: DBService,
    private readonly prisma: PrismaClientService,
  ) { }

  async getHomepageSections(customer, user) {

    // console.log("ABOUT TO MAKE FEEDBACK")
    // const items = [
    //   "ck76f6m5twtrf07689yipydzu",
    //   "ck76f6sjtwu6u0768c6ngqjxq",
    //   "ck2zebtu30tjn0734400gncvv",
    // ]
    // const variants = await Promise.all(
    //   items.map(async item => {
    //     // const variant = this.prisma.client.productVariant({ id: item })
    //     return {
    //       id: await this.prisma.client.productVariant({ id: item }).id(),
    //       name: await this.prisma.client.productVariant({ id: item }).product().name(),
    //       retailPrice: await this.prisma.client.productVariant({ id: item }).retailPrice(),
    //     }
    //   })
    // )
    // console.log("VARIANTS:", variants)
    // const reservationFeedback = await this.prisma.client.createReservationFeedback({
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

    const productRails = await this.db.query.homepageProductRails(
      {},
      `{
        name
      }`
    )

    const sections: any = [
      {
        type: "CollectionGroups",
        __typename: "HomepageSection",
        title: SectionTitle.FeaturedCollection,
      },
      {
        type: "Products",
        __typename: "HomepageSection",
        title: SectionTitle.JustAdded,
      },
      {
        type: "Brands",
        __typename: "HomepageSection",
        title: SectionTitle.Designers,
      },
    ]

    if (customer) {
      sections.push({
        type: "Products",
        __typename: "HomepageSection",
        title: SectionTitle.RecentlyViewed,
      })
    }

    productRails.forEach(rail => {
      sections.push({
        type: "HomepageProductRails",
        __typename: "HomepageSection",
        title: rail.name,
      })
    })

    return sections
  }
}
