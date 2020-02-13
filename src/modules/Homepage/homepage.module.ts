import { Module } from "@nestjs/common"
import { HomepageResolver } from "./homepage.resolver"
import { HomepageSectionResolver } from "./homepageSection.resolver"
import { HomepageResultResolver } from "./homepageResult.resolver"

@Module({
  providers: [HomepageResolver, HomepageSectionResolver, HomepageResultResolver],
})
export class HomepageModule {}
