import { ImageModule } from "@modules/Image/image.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { HomepageFieldsResolver } from "./fields/homepage.fields.resolver"
import { HomepageResultFieldsResolver } from "./fields/homepageResult.fields.resolver"
import { HomepageSectionFieldsResolver } from "./fields/homepageSection.fields.resolver"
import { HomepageQueriesResolver } from "./queries/homepage.queries.resolver"
import { HomepageService } from "./services/homepage.service"
import { HomepageSectionService } from "./services/homepageSection.service"

@Module({
  imports: [PrismaModule, ImageModule],
  providers: [
    HomepageFieldsResolver,
    HomepageQueriesResolver,
    HomepageSectionFieldsResolver,
    HomepageResultFieldsResolver,
    HomepageService,
    HomepageSectionService,
  ],
})
export class HomepageModule {}
