import { Module, forwardRef } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { ErrorModule } from "../Error/error.module"
import { TwilioModule } from "../Twilio/twilio.module"
import { UtilsModule } from "../Utils/utils.module"
import { SMSController } from "./controllers/sms.controller"
import { SMSMutationsResolver } from "./mutations/sms.mutations.resolver"
import { SMSService } from "./services/sms.service"

@Module({
  controllers: [SMSController],
  imports: [PrismaModule, TwilioModule, UtilsModule, ErrorModule],
  providers: [SMSMutationsResolver, SMSService],
  exports: [SMSService],
})
export class SMSModule {}
