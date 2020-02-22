import { Module } from "@nestjs/common"
import { HomepageResolver } from "./homepage.resolver"
import { HomepageSectionResolver } from "./homepageSection.resolver"
import { HomepageResultResolver } from "./homepageResult.resolver"
import { HomepageProductRailResolver } from "./homepageProductRail.resolver"
import { PrismaModule } from "../../prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  providers: [
    HomepageResolver,
    HomepageSectionResolver,
    HomepageResultResolver,
    HomepageProductRailResolver
  ],
})
export class HomepageModule {}
