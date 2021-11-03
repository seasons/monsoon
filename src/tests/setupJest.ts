import path from "path"

import sgMail from "@sendgrid/mail"
import dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

jest.setTimeout(50000)
