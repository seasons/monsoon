import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { TwilioModule } from "../Twilio"
import { UtilsModule } from "../Utils/utils.module"

@Module({
  controllers: [],
  imports: [UtilsModule, PrismaModule, TwilioModule],
})
export class SMSModule {}
