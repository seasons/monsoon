import { Customer } from "@app/nest_decorators"
import { ResolveField, Resolver } from "@nestjs/graphql"

import { HomepageService } from "../services/homepage.service"

@Resolver("Homepage")
export class HomepageFieldsResolver {
  constructor(private readonly homepageService: HomepageService) {}

  @ResolveField()
  async sections(@Customer() customer) {
    return await this.homepageService.getHomepageSections(customer)
  }
}
