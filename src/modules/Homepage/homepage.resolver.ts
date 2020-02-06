import { Resolver, Parent, ResolveProperty, Query } from "@nestjs/graphql"
import { Context } from "../../utils"
import { head } from "lodash"
import { getUserRequestObject, getCustomerFromContext } from "../../auth/utils"

@Resolver("Homepage")
export class HomepageResolver {
  @Query()
  async homepage() {
    console.log("asdf")
    return {
      sections: [
        {
          type: "CollectionGroups",
          __typename: "HomepageSection",
          title: "Featured collection",
          results: async (args, ctx: Context, info) => {
            const collections = await ctx.prisma
              .collectionGroup({ slug: "homepage-1" })
              .collections()
            return collections
          },
        },
        {
          type: "Products",
          __typename: "HomepageSection",
          title: "Just added",
          results: async (args, ctx: Context, info) => {
            const newProducts = await ctx.db.query.products(
              {
                ...args,
                orderBy: "createdAt_DESC",
                first: 8,
                where: {
                  status: "Available",
                },
              },
              `{
              __typename
              id
              images
              brand {
                name
              }
              name
              color {
                name
              }
              retailPrice
            }`
            )

            return newProducts
          },
        },
      ],
    }
  }
  @ResolveProperty()
  async sections(@Parent() homepage) {
    console.log("hi")
    return []
  }

  @ResolveProperty()
  async results(@Parent() sections) {
    console.log("hi2")
    return []
  }
}
