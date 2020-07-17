import { SmsStatus, UserVerificationStatus } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { camelCase, upperFirst } from "lodash"
import Twilio from "twilio"
import { MessageStatus } from "twilio/lib/rest/api/v2010/account/message"

@Injectable()
export class TwilioUtils {
  twilioToPrismaVerificationStatus(
    statusString: string
  ): UserVerificationStatus {
    if (!["approved", "denied", "pending"].includes(statusString)) {
      throw new Error(`Got unrecognized verification status "${statusString}".`)
    }
    return upperFirst(statusString) as UserVerificationStatus
  }

  twilioToPrismaSmsStatus(status: MessageStatus): SmsStatus {
    return upperFirst(camelCase(status)) as SmsStatus
  }
}
