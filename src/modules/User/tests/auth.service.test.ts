import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { EmailUtilsService } from "@app/modules/Email/services/email.utils.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { ImageService } from "@app/modules/Image/services/image.service"
import {
  PushNotificationDataProvider,
  PusherService,
} from "@app/modules/PushNotification"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { TwilioService } from "@app/modules/Twilio/services/twilio.service"
import { TwilioUtils } from "@app/modules/Twilio/services/twilio.utils.service"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { Test } from "@nestjs/testing"

import { AdmissionsService } from "../services/admissions.service"
import { AuthService } from "../services/auth.service"
import { CustomerService } from "../services/customer.service"

describe("Auth Service", () => {
  let auth: AuthService
  let prisma: PrismaService
  let emailService: EmailService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        PushNotificationService,
        EmailService,
        ErrorService,
        UtilsService,
        PaymentService,
        PusherService,
        PushNotificationDataProvider,
        EmailUtilsService,
        ShippingService,
        CustomerService,
        PaymentUtilsService,
        SegmentService,
        ImageService,
        AdmissionsService,
        SMSService,
        TwilioService,
        TwilioUtils,
      ],
    }).compile()

    auth = moduleRef.get<AuthService>(AuthService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    emailService = moduleRef.get<EmailService>(EmailService)
  })

  describe("Signup User", () => {
    let cleanupFunc

    afterEach(async () => {
      cleanupFunc()
    })

    it.only("Successfully creates and sets new user", async () => {
      const auth0Id = "auth0|5dbc6c7b5148b30e148c400e"

      jest.spyOn(auth, "createAuth0User").mockResolvedValue(auth0Id)
      jest
        .spyOn(auth, "createReferralLink")
        .mockResolvedValue({ shortUrl: "szns.co/Test1" })
      jest
        .spyOn<any, any>(auth, "getAuth0UserAccessToken")
        .mockResolvedValue("token")
      jest.spyOn(emailService, "sendSubmittedEmailEmail").mockResolvedValue()

      const firstName = "Test"
      const lastName = "User"
      const email = "test@seasons.nyc"
      const discoveryReference = "instagram"
      const phoneNumber = "6463502715"
      const zipCode = "10013"

      const { user, customer } = await auth.signupUser({
        email,
        password: "Seasons123",
        firstName,
        lastName,
        details: {
          id: "1", // Done to make it easy to retrieve later on in test
          discoveryReference,
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
      expect(customer.plan).toBeUndefined()

      // Customer Details Fields
      const customerDetails = await prisma.client.customerDetail({ id: "1" })
      expect(customerDetails.discoveryReference).toEqual(discoveryReference)
      expect(customerDetails.phoneNumber).toEqual(phoneNumber)

      // Shipping Address Fields
      const customerShippingAddress = await prisma.client.location({ id: "2" })
      expect(customerShippingAddress.zipCode).toEqual(zipCode)

      cleanupFunc = async () => {
        const userNotifInterests = await prisma.client.userPushNotificationInterests()
        const userNotifs = await prisma.client.userPushNotifications()

        await prisma.client.deleteManyUserPushNotificationInterests({
          id_in: userNotifInterests.map(interest => interest.id),
        })
        await prisma.client.deleteUserPushNotification({ id: userNotifs[0].id })
        await prisma.client.deleteLocation({ id: "2" })
        await prisma.client.deleteCustomerDetail({ id: "1" })
        await prisma.client.deleteCustomer({ id: customer.id })
      }
    })
  })
})
