import { PrismaModule } from "@app/prisma/prisma.module"
import { Module, forwardRef } from "@nestjs/common"

import { SMSModule } from "../SMS/sms.module"
import { UtilsModule } from "../Utils/utils.module"
import { TwilioController } from "./controllers/twilio.controller"
import { TwilioService } from "./services/twilio.service"
import { TwilioUtils } from "./services/twilio.utils.service"

@Module({
  controllers: [TwilioController],
  imports: [forwardRef(() => SMSModule), UtilsModule],
  providers: [TwilioService, TwilioUtils],
  exports: [TwilioService, TwilioUtils],
})
export class TwilioModule {}
