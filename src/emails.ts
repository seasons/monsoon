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
              html:
                "If you have any questions, reach out to memberships@seasons.nyc.",
            },
          ],
        },
        title: "We've got your order",
        reservedItems,
        subject: `Order #${reservationNumber} | Your Reservation is Confirmed`,
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
