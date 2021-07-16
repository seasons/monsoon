import { EmailModule } from "@modules/Email/email.module"
import { ErrorModule } from "@modules/Error/error.module"
import { PrismaModule } from "@modules/Prisma/prisma.module"
import { TwilioModule } from "@modules/Twilio/twilio.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module } from "@nestjs/common"

import { SMSController } from "./controllers/sms.controller"
import { SMSMutationsResolver } from "./mutations/sms.mutations.resolver"
import { SMSService } from "./services/sms.service"

@Module({
  controllers: [SMSController],
  imports: [PrismaModule, TwilioModule, UtilsModule, ErrorModule, EmailModule],
  providers: [SMSMutationsResolver, SMSService],
  exports: [SMSService],
})
export class SMSModule {}
