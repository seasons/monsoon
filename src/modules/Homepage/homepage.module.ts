import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { HomepageFieldsResolver } from "./fields/homepage.fields.resolver"
import { HomepageResultFieldsResolver } from "./fields/homepageResult.fields.resolver"
import { HomepageSectionFieldsResolver } from "./fields/homepageSection.fields.resolver"
import { HomepageQueriesResolver } from "./queries/homepage.queries.resolver"
import { HomepageProductRailQueriesResolver } from "./queries/homepageProductRail.queries.resolver"
import { HomepageService } from "./services/homepage.service"
import { HomepageSectionService } from "./services/homepageSection.service"

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
