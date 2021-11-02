// A generic push notification service mock that wont send any push notifs in a test suite
export class PushNotificationServiceMock {
  pushNotifyInterest = async () => null
  pushNotifyUsers = async () => null
}
