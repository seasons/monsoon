import fs from "fs"

import { EmailId } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import Handlebars from "handlebars"
import mustache from "mustache"

@Injectable()
export class EmailDataProvider {
  reservationReturnConfirmation(reservationNumber, itemsReturned, userEmail) {
    return {
      email: {
        subject: `Reservation #${reservationNumber} return processed`,
        body: {
          paragraphs: [
            {
              html: `Items returned: ${itemsReturned}<br></br>User: ${userEmail}`,
            },
            {
              html:
                `Please confirm that the reservation was processed as expected. ` +
                `If anything looks wrong, please alert a developer.`,
            },
          ],
        },
      },
    }
  }

  resetPassword(url: string) {
    return {
      email: {
        body: {
          title: "Changing your Seasons password",
          subject: `Reset your Seasons password`,
          paragraphs: [
            {
              html: `Need to reset your password? No problem. Just click below to get started`,
            },
            {
              html:
                "If you didn't request to change your Seasons password, you don't have to do anything. So that's easy.",
            },
          ],
          button: { text: "Reset my password", url },
        },
      },
    }
  }

  priorityAccess({ name }) {
    return {
      email: {
        title: `Your priority access`,
        subject: `Your priority access`,
        body: {
          paragraphs: [
            { html: `Hey ${name}!` },
            {
              html: `You're receiving this email because you've been given priority access to Seasons.`,
            },
            {
              html:
                `To finish creating your account and start reserving, download or update the Seasons app below and login. ` +
                `If you have any questions or need any help, contact us at membership@seasons.nyc.`,
            },
          ],
          button: { text: "Get the App", url: process.env.APP_URL },
        },
      },
    }
  }

  // TODO: get email data from template.json, rather than in functions
  // as defined above.
  getEmailTemplate(emailId: EmailId, data: any) {
    const template = JSON.parse(
      fs.readFileSync(
        process.cwd() + "/src/modules/Email/template.json",
        "utf-8"
      )
    )[emailId]
    const x = mustache.render(JSON.stringify(template), data)
    return x
  }

  printEmail(data) {
    const path = process.cwd()
    const buffer = fs.readFileSync(path + "/" + "master-email.html")
    const emailTemplate = buffer.toString()
    const RenderedEmailTemplate = Handlebars.compile(emailTemplate)
    const renderedString = RenderedEmailTemplate(data)

    return renderedString
  }
}
