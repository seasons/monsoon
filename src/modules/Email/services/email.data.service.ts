import fs from "fs"

import { EmailId } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import Handlebars from "handlebars"
import mustache from "mustache"

import { ReservedItem } from "../email.types"

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

  reservationConfirmation(
    reservationNumber: number,
    reservedItems: ReservedItem[],
    returnDateFormatted: string,
    trackingNumber?: string,
    trackingUrl?: string
  ) {
    const paragraphs = [
      {
        html: "Sit back, relax and we'll let you know when it's on its way.",
      },
      trackingNumber && trackingUrl
        ? {
            html: `Your tracking number: <a href="${trackingUrl}">${trackingNumber}</a>`,
          }
        : null,
    ]
    return {
      email: {
        body: {
          paragraphs: paragraphs,
        },
        prefooter: {
          paragraphs: [
            {
              html: `Please return your items no later than ${returnDateFormatted}.`,
            },
            { html: `Here's what you'll need to do:` },
            {
              html:
                `<ol style="margin:0px"><li>Place the items you’re returning into your bag - hangers included!</li>` +
                `<li>Insert the return shipping label into the pouch on the outside of the bag.</li>` +
                `<li>Drop off at your closest UPS pick up location.</li></ol>`,
            },
            {
              html:
                "Once we’ve received and processed your items, we’ll send you an email " +
                "confirmation and your bag will be reset for you to place your next order!" +
                " This typically takes about 2-3 business days.",
            },
            {
              html: `If you have any questions, reach out to ${process.env.MAIN_CONTACT_EMAIL}`,
            },
          ],
        },
        title: "We've got your order",
        reservedItems,
        subject: `Order #${reservationNumber} | Your Reservation is Confirmed`,
      },
    }
  }

  completeAccount(firstName) {
    return {
      email: {
        body: {
          paragraphs: [
            {
              html:
                `Hey ${firstName}, thanks for waiting. We're ready for you. ` +
                `Tap the button below to get the app, choose your membership plan, and start reserving.`,
            },
            {
              html: `Heads up -- your spot will remain open for 48 hours. After that, due to demand, it will be given to someone else.`,
            },
            { html: "Thanks,<br>The Seasons Team" },
          ],
          button: { text: "Get the app", url: process.env.MOBILE_APP_URL },
        },
        prefooter: {
          paragraphs: [
            {
              html: `If you have any questions, reach out to ${process.env.MAIN_CONTACT_EMAIL}.`,
            },
          ],
        },
        title: "You're in. Let's choose your plan",
        subject: "You're in. Let's choose your plan",
      },
    }
  }

  freeToReserve() {
    return {
      email: {
        body: {
          paragraphs: [
            {
              html:
                `Good news! Your items made it back to Seasons HQ and we've reset your bag.` +
                ` You can now place a new reservation`,
            },
            {
              html:
                "If you have any questions, feel free to reply to this e-mail.",
            },
          ],
        },
        title: "We've received your return",
        subject: "We've received your return",
      },
    }
  }

  welcomeToSeasons(firstName) {
    return {
      email: {
        body: {
          paragraphs: [
            {
              html:
                `Hey ${firstName}, thank you so much for signing up. We're excited ` +
                `you're here. As a Founding Member, you'll be the first to know about` +
                ` exclusive features, products and restocks.`,
            },
            {
              html:
                `We're still actively working on the beta app. If you have any ideas` +
                ` or thoughts about the service, give us your feedback! Good or bad.` +
                ` Just write to ${process.env.MAIN_CONTACT_EMAIL}`,
            },
          ],
        },
        title: "Welcome to Seasons.",
        subject: "Welcome to Seasons",
      },
    }
  }

  returnReminder({ name, returnDate }) {
    return {
      email: {
        body: {
          paragraphs: [
            { html: `Hey ${name}!<br><br>It's time to return your items.` },
            {
              html: `Please <b>drop off</b> your bag no later than <b>${returnDate}</b>. Once we've received and processed your items, we'll send you an email confirmation and your bag will be reset for you to place your next order! This typically takes about 2-3 business days.`,
            },
            { html: `As a reminder, here's what you need to do:` },
            {
              html:
                `<ol style="margin:0px"><li>Place the items you’re returning into your bag - hangers included!</li>` +
                `<li>Insert the return shipping label into the pouch on the outside of the bag.</li>` +
                `<li>Drop off at your closest UPS pick up location.</li></ol>`,
            },
            { html: "Thanks,<br>The Seasons Team" },
          ],
        },
        prefooter: {
          paragraphs: [
            {
              html: `If you have any questions, reach out to ${process.env.MAIN_CONTACT_EMAIL}.`,
            },
          ],
        },
        title: "It's time to return your items",
        subject: "It's time to return your items",
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

  verifyEmail() {
    return {
      email: {
        title: "Welcome to Seasons.",
        body: {
          subject: `Verify your email`,
          paragraphs: [
            {
              html: `Hey {{user.given_name}}!`,
            },
            {
              html:
                "Welcome to Seasons, a members only subscription service to the most coveted menswear and streetwear brands. To make sure we have the right person, please verify your email by clicking on the button below.",
            },
          ],
          button: { text: "Verify Email", url: "{{url}}" },
        },
        prefooter: {
          paragraphs: [
            {
              html: `If you have any questions, reach out to ${process.env.MAIN_CONTACT_EMAIL}.`,
            },
          ],
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
