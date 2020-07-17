import { Injectable } from "@nestjs/common"
import Twilio from "twilio"

const accountSid = process.env.TWILIO_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

@Injectable()
export class TwilioService {
  client = Twilio(accountSid, authToken)
}
