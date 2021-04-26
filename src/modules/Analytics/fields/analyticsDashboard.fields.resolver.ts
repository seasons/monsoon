import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("AnalyticsDashboard")
export class AnalyticsDashboardFieldResolver {
  constructor() {}

  @ResolveField()
  async elements(@Parent() dashboard, @Args() { where }) {
    // TODO: In the future, we should adjust this so we only query for the
    // element requested
    if (where) {
      return dashboard?.elements.filter(a => a.slug === where.slug)
    }
    return dashboard?.elements
  }
}
