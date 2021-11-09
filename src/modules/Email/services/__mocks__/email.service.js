// A generic email service mock that wont send any emails in a test suite
export class EmailServiceMock {
  sendSubmittedEmailEmail = async () => null
  sendAuthorizedEmail = async () => null
  sendRecommendedItemsNurtureEmail = async () => null
  sendAuthorizedDayTwoFollowup = async () => null
  sendBuyUsedOrderConfirmationEmail = async () => null
  sendUnpaidMembershipEmail = async () => null
  sendReturnToGoodStandingEmail = async () => null
  sendReferralConfirmationEmail = async () => null
  sendWaitlistedEmail = async () => null
  sendSubscribedEmail = async () => null
  sendAdminConfirmationEmail = async () => null
  sendPriorityAccessEmail = async () => null
  sendReservationConfirmationEmail = async () => {
    return null
  }
  sendReturnReminderEmail = async () => null
  sendRestockNotificationEmails = async () => null
  sendYouCanNowReserveAgainEmail = async () => null
}

module.exports = EmailServiceMock
