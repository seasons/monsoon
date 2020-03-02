import { Resolver, ResolveProperty } from "@nestjs/graphql"
import { HomepageService } from "../services/homepage.service"

@Resolver("Homepage")
export class HomepageFieldsResolver {
  constructor(private readonly homepageService: HomepageService) {}

  @ResolveProperty()
  async sections() {
    return await this.homepageService.getHomepageSections()
  }
}


