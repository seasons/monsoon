import { Module } from "@nestjs/common"
import { HomepageFieldsResolver } from "./fields/homepage.fields.resolver"
import { HomepageQueriesResolver } from "./queries/homepage.queries.resolver"
import { HomepageSectionFieldsResolver } from "./fields/homepageSection.fields.resolver"
import { HomepageResultFieldsResolver } from "./fields/homepageResult.fields.resolver"
import { HomepageProductRailQueriesResolver } from "./queries/homepageProductRail.queries.resolver"
import { PrismaModule } from "../../prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  providers: [
    HomepageFieldsResolver,
    HomepageQueriesResolver,
    HomepageSectionFieldsResolver,
    HomepageResultFieldsResolver,
    HomepageProductRailQueriesResolver
  ],
})
export class HomepageModule {}
