import path from "path"

import sgMail from "@sendgrid/mail"
import dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env.testing") })
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Need to mock to solve issue within Drip package
jest.mock("request-promise-native")
