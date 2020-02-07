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
}
