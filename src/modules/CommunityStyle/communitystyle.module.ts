import { ImageModule } from "@modules/Image"
import { PushNotificationModule } from "@modules/PushNotification"
import { UserModule } from "@modules/User/user.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { CommunityStyleMutationsResolver } from "./mutations/communitystyle.mutations.resolver"
import { CommunityStyleQueriesResolver } from "./queries/communitystyle.queries.resolver"
import { CommunityStyleService } from "./services/communitystyle.service"

@Module({
  imports: [ImageModule, PrismaModule, PushNotificationModule, UserModule],
  providers: [
    CommunityStyleMutationsResolver,
    CommunityStyleQueriesResolver,
    CommunityStyleService,
  ],
  exports: [CommunityStyleService],
})
export class CommunityStyleModule {}
