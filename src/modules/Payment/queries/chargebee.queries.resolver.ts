import { Resolver, Query, Args, Context } from "@nestjs/graphql"
import { PrismaClientService } from "../../../prisma/client.service"
import { AuthService } from "../../User/auth.service"
import chargebee from "chargebee"
import { User } from "../../User/user.decorator"


export enum SectionTitle {
  FeaturedCollection = "Featured collection",
  JustAdded = "Just added",
  RecentlyViewed = "Recently viewed",
}

@Resolver("Chargebee")
export class ChargebeeQueriesResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaClientService
  ) {}

  @Query()
  async chargebeeCheckout(@Args() { planID }, @Context() ctx, @User() user) {
    // Get email, firstName, lastName, phoneNumber of targetUser
    const { email, firstName, lastName } = user
    const correspondingCustomer = await this.authService.getCustomerFromUserID(user.id)
    const { phoneNumber } = await this.prisma.client
      .customer({ id: correspondingCustomer.id })
      .detail()

    // translate the passed planID into a chargebee-readable version
    let truePlanID
    if (planID === "AllAccess") {
      truePlanID = "all-access"
    } else if (planID === "Essential") {
      truePlanID = "essential"
    } else {
      throw new Error("unrecognized planID")
    }

    // make the call to chargebee
    chargebee.configure({
      site: process.env.CHARGEBEE_SITE,
      api_key: process.env.CHARGEE_API_KEY,
    })
    const hostedPage = await new Promise((resolve, reject) => {
      chargebee.hosted_page
        .checkout_new({
          subscription: {
            plan_id: truePlanID,
          },
          customer: {
            id: user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            phone: phoneNumber,
          },
        })
        .request((error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result.hosted_page)
          }
        })
    }).catch(error => {
      throw new Error(JSON.stringify(error))
    })

    // Track the selection
    ctx.analytics.track({
      userId: user.id,
      event: "Opened Checkout",
      properties: {
        plan: planID,
      },
    })

    return hostedPage
  }
}