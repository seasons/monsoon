import { TwilioUtils } from "@app/modules/Twilio/services/twilio.utils.service"
import { TwilioEvent } from "@app/modules/Twilio/twilio.types"
import { Body, Controller, Post } from "@nestjs/common"

import { SMSService } from "../services/sms.service"

@Controller("sms_events")
export class SMSController {
  constructor(
    private readonly twilioUtils: TwilioUtils,
    private readonly sms: SMSService
  ) {}

  @Post()
  async handlePost(@Body() body: TwilioEvent) {
    switch (body.To) {
      case process.env.TWILIO_PHONE_NUMBER:
        return await this.sms.handleSMSResponse(body)
      default:
        if (!!body.SmsStatus && body.From === process.env.TWILIO_PHONE_NUMBER) {
          await this.sms.handleSMSStatusUpdate(
            body.MessageSid,
            this.twilioUtils.twilioToPrismaSmsStatus(body.SmsStatus)
          )
        }
    }
  }
}
