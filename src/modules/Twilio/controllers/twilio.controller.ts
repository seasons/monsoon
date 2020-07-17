import { SMSService } from "@app/modules/SMS/services/sms.service"
import { Body, Controller, Post } from "@nestjs/common"
import { MessageStatus } from "twilio/lib/rest/api/v2010/account/message"

import { TwilioUtils } from "../services/twilio.utils.service"

type TwilioEvent = {
  MessageSid: string
  SmsStatus: MessageStatus
}

@Controller("twilio_events")
export class TwilioController {
  constructor(
    private readonly smsService: SMSService,
    private readonly twilioUtils: TwilioUtils
  ) {}

  @Post()
  async handlePost(@Body() body: TwilioEvent) {
    this.smsService.handleSMSStatusUpdate(
      body.MessageSid,
      this.twilioUtils.twilioToPrismaSmsStatus(body.SmsStatus)
    )
  }
}
