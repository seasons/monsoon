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
              html: `Please confirm that the reservation was processed as expected. If anything looks wrong, please alert a developer.`,
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
  completeAccount: (firstName, url) => {
    return {
      email: {
        body: {
          paragraphs: [
            {
              html: `Hey ${firstName}, thanks for waiting. We're ready for you. Tap the button below to choose your membership plan, get the beta app and start reserving.`,
            },
            {
              html:
                "Heads up -- due to demand, we may need to give your spot to someone else if you don't choose your plan within the next 48 hours.",
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
}

export interface ReservedItem {
  brand: string
  url: string
  name: string
  price: number
}
