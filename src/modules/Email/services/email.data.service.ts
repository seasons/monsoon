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
              html: `Hey ${firstName}!`,
            },
            {
              html:
                `You're receiving this email because you created an account and joined our waitlist. ` +
                `We really appreciate your patience and are excited to extend you an invite!`,
            },
            {
              html:
                `To choose your plan and start reserving, download or update the Seasons app below, ` +
                `and visit your profile. If you have any questions or need any help, contact us at ${process.env.MAIN_CONTACT_EMAIL}.`,
            },
            {
              html: `For a limited time, enjoy $30 off of your first month using code: NEW30 at checkout.`,
            },
            { html: "Thanks,<br>The Seasons Team" },
            {
              html:
                `P.S. Due to demand, we may have to pass along your invite to the next person in line ` +
                `if you don't finish signing up in the next 72 hours.`,
            },
          ],
          button: { text: "Choose Plan", url: process.env.APP_URL },
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
                `Hey ${firstName},<br><br>Thank you so much for signing up. We're excited ` +
                `you're here. You'll be the first to know about` +
                ` exclusive features, products and restocks.`,
            },
            {
              html: `If you have any questions or feedback, we'd love to hear from you at ${process.env.MAIN_CONTACT_EMAIL}`,
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
                `To finish creating your account and start reserving, download or update the Seasons app below. ` +
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
