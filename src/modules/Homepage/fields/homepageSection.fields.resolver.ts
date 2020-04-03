import { Resolver, Parent, Args, ResolveField } from "@nestjs/graphql"
import { HomepageSectionService } from "../services/homepageSection.service"

@Resolver("HomepageSection")
export class HomepageSectionFieldsResolver {
  constructor(
    private readonly homepageSectionService: HomepageSectionService
  ) {}

  @ResolveField()
  async results(@Parent() section, @Args() args) {
    return await this.homepageSectionService.getResultsForSection(
      section.title,
      args
    )
  }
}
