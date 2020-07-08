import { UserModule } from "@modules/User/user.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { TwilioModule } from "../Twilio"
import { UtilsModule } from "../Utils/utils.module"
import { SMSMutationsResolver } from "./mutations/sms.mutations.resolver"
import { SMSService } from "./services/sms.service"

@Module({
  imports: [PrismaModule, TwilioModule, UserModule, UtilsModule],
  providers: [SMSMutationsResolver, SMSService],
  exports: [SMSService],
})
export class SMSModule {}
