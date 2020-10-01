import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailDataProvider } from "@app/modules/Email/services/email.data.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { PusherService } from "@app/modules/PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "@app/modules/PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { ShippingUtilsService } from "@app/modules/Shipping/services/shipping.utils.service"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { CustomerStatus } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { ApolloError } from "apollo-server"

import { AdmissionsService } from "../services/admissions.service"
import { AuthService } from "../services/auth.service"
import { CustomerService } from "../services/customer.service"

describe("Customer Service", () => {
  let customerService: CustomerService
  let prisma: PrismaService
  let emailService: EmailService
  let shippingUtilsService: ShippingUtilsService
  let testUtils: TestUtilsService
  let admissionsService: AdmissionsService

  beforeAll(async () => {
    prisma = new PrismaService()
    const utilsService = new UtilsService(prisma)
    testUtils = new TestUtilsService(prisma, new UtilsService(prisma))
    const pusherService = new PusherService()
    const pushNotificationsDataProvider = new PushNotificationDataProvider()
    const pushNotificationsService = new PushNotificationService(
      pusherService,
      pushNotificationsDataProvider,
      prisma
    )
    shippingUtilsService = new ShippingUtilsService()
    const auth = new AuthService(
      prisma,
      pushNotificationsService,
      shippingUtilsService
    )
    const shippingService = new ShippingService(prisma, utilsService)
    admissionsService = new AdmissionsService(prisma, utilsService)
    const segmentService = new SegmentService()
    emailService = new EmailService(
      prisma,
      utilsService,
      new EmailDataProvider()
    )
    customerService = new CustomerService(
      auth,
      prisma,
      shippingService,
      admissionsService,
      emailService,
      pushNotificationsService,
      segmentService
    )
  })

  describe("Update Customer Details", () => {
    test.each([
      ["Invited", true],
      ["Invited", false],
      ["Waitlisted", true],
      ["Waitlisted", false],
      ["Created", false],
    ])(
      "Successfully updates customer details: (old status: %p, authorized: %p)",
      async (oldStatus, authorized) => {
        jest
          .spyOn<any, any>(emailService, "sendTransactionalEmail")
          .mockResolvedValue(null)

        const { customer, cleanupFunc } = await testUtils.createTestCustomer(
          {
            status: oldStatus as CustomerStatus,
            email: authorized ? "membership@seasons.nyc" : undefined,
          },
          `{
            id
            user {
              id
            }
          }`
        )

        const newPlan = "Essential"
        const newCustomer = await customerService.updateCustomer(
          {
            where: {
              id: customer.id,
            },
            data: {
              status: authorized ? "Authorized" : undefined,
              plan: newPlan,
            },
          },
          `{
          id
          status
          plan
          user {
            id
          }
        }`,
          null
        )

        if (authorized) {
          if (oldStatus == "Waitlisted") {
            const emailReceipts = await prisma.client.emailReceipts({
              where: {
                user: { id: newCustomer.user.id },
              },
            })
            expect(emailReceipts.length).toEqual(1)
            expect(emailReceipts[0].emailId).toEqual("CompleteAccount")
          } else if (oldStatus == "Invited") {
            const emailReceipts = await prisma.client.emailReceipts({
              where: {
                user: { id: newCustomer.user.id },
              },
            })
            expect(emailReceipts.length).toEqual(1)
            expect(emailReceipts[0].emailId).toEqual("PriorityAccess")
          }
          const notifReceipts = await prisma.client.pushNotificationReceipts({
            where: {
              users_some: { id: newCustomer.user.id },
            },
          })
          expect(notifReceipts.length).toEqual(1)
          expect(notifReceipts[0].notificationKey).toEqual("CompleteAccount")
        }

        expect(newCustomer.plan).toEqual(newPlan)

        await prisma.client.deleteManyPushNotificationReceipts({
          users_some: { id: newCustomer.user.id },
        })
        await prisma.client.deleteManyEmailReceipts({
          user: { id: newCustomer.user.id },
        })
        cleanupFunc()
      }
    )
  })

  describe("Add Customer Details", () => {
    test.each([["Waitlisted"], [null]])(
      "Successfully adds customer details from onboarding: (status arg: %p)",
      async status => {
        const weight = [150, 160]
        const height = 72
        const topSizes = ["L", "XL"]
        const waistSizes = [32, 34]

        jest
          .spyOn(shippingUtilsService, "getCityAndStateFromZipCode")
          .mockResolvedValue({ city: "New York", state: "NY" })

        const { customer, cleanupFunc } = await testUtils.createTestCustomer(
          { status: "Created" },
          `{
          id
          user {
            id
          }
        }`
        )

        const user = await prisma.client.user({ id: customer.user.id })
        const newCustomer = await customerService.addCustomerDetails(
          {
            details: {
              weight: { set: weight },
              height,
              topSizes: { set: topSizes },
              waistSizes: { set: waistSizes },
            },
            status: status,
          },
          customer,
          user,
          `{
          id
          status
        }`
        )

        const newCustomerDetails = (await prisma.client.customerDetails())[0]

        expect(newCustomerDetails.topSizes).toEqual(topSizes)
        expect(newCustomerDetails.waistSizes).toEqual(waistSizes)
        expect(newCustomerDetails.weight).toEqual(weight)
        expect(newCustomerDetails.height).toEqual(height)

        expect(newCustomer.status).toEqual(status ? status : "Created")

        cleanupFunc()
      }
    )
  })

  describe("Triage Customer", () => {
    let cleanupFunc

    afterEach(() => {
      cleanupFunc()
    })

    it("Throws on status not Created or Invited", async () => {
      const {
        customer,
        cleanupFunc: customerCleanupFunc,
      } = await testUtils.createTestCustomer(
        { status: "Waitlisted" },
        `{
        id
        user {
          id
        }
      }`
      )
      expect(
        customerService.triageCustomer({ id: customer.id }, null)
      ).rejects.toThrowError(ApolloError)

      cleanupFunc = customerCleanupFunc
    })

    it("Updates customer to Authorized", async () => {
      jest
        .spyOn(admissionsService, "belowWeeklyNewActiveUsersOpsThreshold")
        .mockResolvedValue(true)
      jest
        .spyOn(admissionsService, "haveSufficientInventoryToServiceCustomer")
        .mockResolvedValue(true)
      jest.spyOn(admissionsService, "zipcodeAllowed").mockReturnValue(true)

      const {
        customer,
        cleanupFunc: customerCleanupFunc,
      } = await testUtils.createTestCustomer(
        { detail: {}, status: "Created" },
        `{
        id
        status
        user {
          id
        }
      }`
      )

      const result = await customerService.triageCustomer(
        { id: customer.id },
        null
      )
      expect(result).toEqual("Authorized")

      cleanupFunc = customerCleanupFunc
    })
  })
})
