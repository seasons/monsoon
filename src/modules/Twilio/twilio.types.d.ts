import { MessageStatus } from "twilio/lib/rest/api/v2010/account/message"

export type TwilioEvent = {
  MessageSid: string
  AccountSid: string
  From: string
  To: string
  SmsStatus: MessageStatus
  Body: string
}
