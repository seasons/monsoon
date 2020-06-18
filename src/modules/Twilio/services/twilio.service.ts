import Twilio from "twilio"

const accountSid = process.env.TWILIO_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

@Injectable()
class TwilioService {
  static client = new Twilio(accountSid, authToken, {
    lazyLoading: true,
  })
}
