import { PusherService } from "@app/modules/PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "@app/modules/PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { ShippingUtilsService } from "@app/modules/Shipping/services/shipping.utils.service"
import { PrismaService } from "@app/prisma/prisma.service"

import { AuthService } from "../services/auth.service"

describe("Auth Service", () => {
  let auth: AuthService
  let prisma: PrismaService
  let shippingUtilsService: ShippingUtilsService

  beforeAll(async () => {
    prisma = new PrismaService()
    const pusherService = new PusherService()
    const pushNotificationsDataProvider = new PushNotificationDataProvider()
    const pushNotificationsService = new PushNotificationService(
      pusherService,
      pushNotificationsDataProvider,
      prisma
    )
    shippingUtilsService = new ShippingUtilsService()
    auth = new AuthService(
      prisma,
      pushNotificationsService,
      shippingUtilsService
    )
  })

  describe("Signup User", () => {
    let cleanupFuncs = []

    afterEach(async () => {
      for (const func of cleanupFuncs) {
        await func()
      }
      cleanupFuncs = []
    })

    it("Successfully creates and sets new user", async () => {
      const auth0Id = "auth0|5dbc6c7b5148b30e148c400e"

      jest.spyOn(auth, "createAuth0User").mockResolvedValue(auth0Id)
      jest
        .spyOn<any, any>(auth, "getAuth0UserAccessToken")
        .mockResolvedValue("token")
      jest
        .spyOn(shippingUtilsService, "getCityAndStateFromZipCode")
        .mockResolvedValue({ city: "New York", state: "NY" })

      const firstName = "Test"
      const lastName = "User"
      const email = "test@seasons.nyc"
      const phoneOS = "iOS"
      const phoneNumber = "646-350-2715"
      const zipCode = "10013"

      const { user, customer } = await auth.signupUser({
        email,
        password: "Seasons123",
        firstName,
        lastName,
        details: {
          id: "1", // Done to make it easy to retrieve later on in test
          phoneOS,
          phoneNumber,
          shippingAddress: {
            create: {
              id: "2", // Done to make it easy to retrieve later on in test
              zipCode,
            },
          },
        },
      })

      // User Fields
      expect(user.email).toEqual(email)
      expect(user.auth0Id).toEqual(auth0Id)
      expect(user.firstName).toEqual(firstName)
      expect(user.lastName).toEqual(lastName)
      expect(user.roles).toContain("Customer")

      // Customer Fields
      expect(customer.status).toEqual("Created")
      expect(customer.plan).toBeNull()

      // Customer Details Fields
      const customerDetails = await prisma.client.customerDetail({ id: "1" })
      expect(customerDetails.phoneOS).toEqual(phoneOS)
      expect(customerDetails.phoneNumber).toEqual(phoneNumber)

      // Shipping Address Fields
      const customerShippingAddress = await prisma.client.location({ id: "2" })
      expect(customerShippingAddress.zipCode).toEqual(zipCode)

      const cleanupFunc = async () => {
        const userNotifInterests = await prisma.client.userPushNotificationInterests()
        const userNotifs = await prisma.client.userPushNotifications()

        await Promise.all(
          userNotifInterests.map(interest => {
            return prisma.client.deleteUserPushNotificationInterest({
              id: interest.id,
            })
          })
        )
        await prisma.client.deleteUserPushNotification({ id: userNotifs[0].id })
        await prisma.client.deleteLocation({ id: "2" })
        await prisma.client.deleteCustomerDetail({ id: "1" })
        await prisma.client.deleteCustomer({ id: customer.id })
      }

      cleanupFuncs.push(cleanupFunc)
    })
  })
})
