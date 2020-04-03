import { Resolver, ResolveField } from "@nestjs/graphql"
import { HomepageService } from "../services/homepage.service"
import { Customer } from "../../../nest_decorators"

@Resolver("Homepage")
export class HomepageFieldsResolver {
  constructor(private readonly homepageService: HomepageService) {}

  @ResolveField()
  async sections(@Customer() customer) {
    return await this.homepageService.getHomepageSections(customer)
  }
}
