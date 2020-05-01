import { Customer } from "@app/decorators"
import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { HomepageSectionService } from "../services/homepageSection.service"

@Resolver("HomepageSection")
export class HomepageSectionFieldsResolver {
  constructor(
    private readonly homepageSectionService: HomepageSectionService
  ) {}

  @ResolveField()
  async results(@Parent() section, @Args() args, @Customer() customer) {
    return await this.homepageSectionService.getResultsForSection(
      section.title,
      args,
      customer.id
    )
  }
}
