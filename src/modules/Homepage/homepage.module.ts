import { HomepageFieldsResolver } from "./fields/homepage.fields.resolver"
import { HomepageProductRailQueriesResolver } from "./queries/homepageProductRail.queries.resolver"
import { HomepageQueriesResolver } from "./queries/homepage.queries.resolver"
import { HomepageResultFieldsResolver } from "./fields/homepageResult.fields.resolver"
import { HomepageSectionFieldsResolver } from "./fields/homepageSection.fields.resolver"
import { HomepageSectionService } from "./services/homepageSection.service"
import { HomepageService } from "./services/homepage.service"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  providers: [
    HomepageFieldsResolver,
    HomepageQueriesResolver,
    HomepageSectionFieldsResolver,
    HomepageResultFieldsResolver,
    HomepageProductRailQueriesResolver,
    HomepageService,
    HomepageSectionService,
  ],
})
export class HomepageModule {}
