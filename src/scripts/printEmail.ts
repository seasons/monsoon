import "module-alias/register"

import * as fs from "fs"

import { EmailDataProvider } from "../modules/Email/services/email.data.service"

const run = async () => {
  const edp = new EmailDataProvider()

  const email = edp.printEmail(edp.verifyEmail())
  fs.writeFileSync("verify-email.html", email)
}

run()
