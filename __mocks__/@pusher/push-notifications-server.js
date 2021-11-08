class PushNotificationServerMock {
  constructor({ instanceId, secretKey }) {}

  generateToken = () => ({ token: "" })
  publishToInterests = async (interests, payload) => null
  publishToUsers = async (emails, payload) => null
}

module.exports = PushNotificationServerMock
