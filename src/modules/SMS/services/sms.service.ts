import { TwilioService } from "@app/modules/Twilio"
import { Injectable } from "@nestjs/common"

@Injectable()
export class SMSService {
  constructor(private readonly twilio: TwilioService) {}

  startSMSVerification() {}

  checkSMSVerification() {}
}
