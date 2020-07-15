import { DateTime } from "@app/prisma/prisma.binding"
import { Body, Controller, Post } from "@nestjs/common"
import { MessageStatus } from "twilio/lib/rest/api/v2010/account/message"

type TwilioEvent = {
  date_created: DateTime
  sid: string
  status: MessageStatus
}

export const twilioToPrismaSMSStatus = () => {}

@Controller("twilio_events")
export class TwilioController {
  @Post()
  async handlePost(@Body() body: TwilioEvent) {
    // store somewhere?
  }
}
