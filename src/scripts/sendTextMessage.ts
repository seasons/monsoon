import "module-alias/register"

import { TwilioService } from "../modules/Twilio"

const run = async () => {
  const t = new TwilioService()
  await t.client.messages.create({
    body: "Hello from my terminal",
    from: "+13472626300",
    to: "+19175870921",
  })
}

const createVerificationService = async () => {
  const t = new TwilioService()
  const x = await t.client.verify.services.create({
    friendlyName: "Staging Verification Service",
    codeLength: 6,
  })
  console.log(x)
}
createVerificationService()
