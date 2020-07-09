import { Module } from "@nestjs/common"

import { UtilsModule } from "../Utils/utils.module"
import { TwilioService } from "./services/twilio.service"

@Module({
  exports: [TwilioService],
  providers: [TwilioService],
  imports: [UtilsModule],
})
export class TwilioModule {}
