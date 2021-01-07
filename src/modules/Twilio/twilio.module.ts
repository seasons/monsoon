import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"

import { UtilsModule } from "../Utils/utils.module"
import { TwilioService } from "./services/twilio.service"
import { TwilioUtils } from "./services/twilio.utils.service"

@Module({
  imports: [PrismaModule, UtilsModule],
  providers: [TwilioService, TwilioUtils],
  exports: [TwilioService, TwilioUtils],
})
export class TwilioModule {}
