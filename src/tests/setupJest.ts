import path from "path"

import sgMail from "@sendgrid/mail"
import dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

jest.setTimeout(50000)
