import { Resolver, ResolveProperty } from "@nestjs/graphql"
import { HomepageService } from "../services/homepage.service"
import { Customer, User } from "../../../nest_decorators"

@Resolver("Homepage")
export class HomepageFieldsResolver {
  constructor(private readonly homepageService: HomepageService) { }

  @ResolveProperty()
  async sections(@Customer() customer, @User() user) {
    return await this.homepageService.getHomepageSections(customer, user)
  }
}