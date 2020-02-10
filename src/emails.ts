export const emails = {
  reservationReturnConfirmationData: (
    reservationNumber,
    itemsReturned,
    userEmail
  ) => {
    return {
      email: {
        subject: `Reservation #${reservationNumber} return processed`,
        body: {
          paragraphs: [
            {
              html: `Items returned: ${itemsReturned}<br></br>User: ${userEmail}}`,
            },
            {
              html:
                `Please confirm that the reservation was processed as expected.` +
                `If anything looks wrong, please alert a developer.`,
            },
          ],
        },
      },
    }
  },
  reservationConfirmationData: (
    reservationNumber,
    reservedItems: ReservedItem[]
  ) => {
    return {
      email: {
        body: {
          paragraphs: [
            {
              html:
                "Sit back, relax and we'll let you know when it's on its way.",
            },
          ],
        },
        prefooter: {
          paragraphs: [
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
  },
  completeAccountData: (firstName, url) => {
    return {
      email: {
        body: {
          paragraphs: [
            {
              html:
                `Hey ${firstName}, thanks for waiting. We're ready for you. ` +
                `Tap the button below to choose your membership plan, get the beta app and start reserving.`,
            },
            {
              html:
                `Heads up -- due to demand, we may need to give your spot to someone` +
                ` else if you don't choose your plan within the next 48 hours.`,
            },
            { html: "Thanks,<br>The Seasons Team" },
          ],
          button: { text: "Choose plan", url },
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
  },
  freeToReserveData: () => {
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
        title: "We've got your order",
        subject: "We've received your return",
      },
    }
  },
  welcomeToSeasonsData: firstName => {
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
            {
              html:
                '<b style="color:#000000">How to install the app and reserve your first three pieces</b>',
            },
            {
              html:
                `<ol><li>View this e-mail on your iOS device.</li><li>If you don\'t` +
                ` already have it, download the <a href="${process.env.TESTFLIGHT_URL}">testflight app</a>.` +
                `</li><li><a href="${process.env.TESTFLIGHT_URL}">Click here</a> to install` +
                ` the seasons app on testflight.</li><li>Login and start reserving!</li></ol>`,
            },
          ],
        },
        title: "Welcome to Seasons.",
        subject: "Welcome to Seasons",
      },
    }
  },
}

export interface ReservedItem {
  brand: string
  url: string
  name: string
  price: number
}
