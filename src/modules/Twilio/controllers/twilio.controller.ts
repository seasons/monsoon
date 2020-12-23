import { SMSService } from "@app/modules/SMS/services/sms.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Body, Controller, Post } from "@nestjs/common"
import { MessageStatus } from "twilio/lib/rest/api/v2010/account/message"

import { TwilioUtils } from "../services/twilio.utils.service"

type TwilioEvent = {
  MessageSid: string
  AccountSid: string
  From: string
  To: string
  SmsStatus: MessageStatus
}

@Controller("twilio_events")
export class TwilioController {
  constructor(
    private readonly twilioUtils: TwilioUtils,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  async handlePost(@Body() body: TwilioEvent) {
    switch (body.To) {
      case process.env.TWILIO_PHONE_NUMBER:
        console.log("Message from customer")
        break
      default:
        if (!!body.SmsStatus && body.From === process.env.TWILIO_PHONE_NUMBER) {
          await this.prisma.client.updateManySmsReceipts({
            data: {
              status: this.twilioUtils.twilioToPrismaSmsStatus(body.SmsStatus),
            },
            where: { externalId: body.MessageSid },
          })
        }
    }
  }
}
