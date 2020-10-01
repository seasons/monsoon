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
import { PrismaService } from "@app/prisma/prisma.service"

import { AdmissionsService } from "../services/admissions.service"
import { AuthService } from "../services/auth.service"
import { CustomerService } from "../services/customer.service"

describe("Customer Service", () => {
  let customerService: CustomerService
  let prisma: PrismaService
  let pushNotificationsService: PushNotificationService
  let shippingUtilsService: ShippingUtilsService
  let testUtils: TestUtilsService

  beforeAll(async () => {
    prisma = new PrismaService()
    const utilsService = new UtilsService(prisma)
    testUtils = new TestUtilsService(prisma, new UtilsService(prisma))
    const pusherService = new PusherService()
    const pushNotificationsDataProvider = new PushNotificationDataProvider()
    pushNotificationsService = new PushNotificationService(
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
    const admissionsService = new AdmissionsService(prisma, utilsService)
    const segmentService = new SegmentService()
    const emailService = new EmailService(
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
    let cleanupFunc = () =>
      void afterEach(async () => {
        cleanupFunc()
      })

    function runTest(oldStatus, authorized) {
      it(
        "Successfully updates customer details: " +
          oldStatus +
          (authorized ? " -> Authorized" : " (Not Authorized yet)"),
        async () => {
          jest
            .spyOn(pushNotificationsService, "pushNotifyUser")
            .mockResolvedValue(null)

          const {
            customer,
            cleanupFunc: customerCleanupFunc,
          } = await testUtils.createTestCustomer(
            { status: oldStatus },
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
              const receipts = await prisma.client.emailReceipts({
                where: {
                  user: { id: newCustomer.user.id },
                },
              })
              expect(receipts.length).toEqual(1)
              expect(receipts[0].emailId).toEqual("CompleteAccount")
            } else if (oldStatus == "Invited") {
              const receipts = await prisma.client.emailReceipts({
                where: {
                  user: { id: newCustomer.user.id },
                },
              })
              expect(receipts.length).toEqual(1)
              expect(receipts[0].emailId).toEqual("PriorityAccess")
            }
            // Check Push Notif receipt
          }

          expect(newCustomer.plan).toEqual(newPlan)

          cleanupFunc = customerCleanupFunc
        }
      )
    }
    runTest("Invited", true)
    runTest("Waitlisted", true)
    runTest("Invited", false)
    runTest("Waitlisted", false)
    runTest("Created", false)
  })

  describe("Add Customer Details", () => {
    let cleanupFunc

    afterEach(async () => {
      cleanupFunc()
    })

    function runTest(status) {
      it(
        "Successfully adds customer details from onboarding " +
          (!!status ? "with" : "without") +
          " status",
        async () => {
          const weight = [150, 160]
          const height = 72
          const topSizes = ["L", "XL"]
          const waistSizes = [32, 34]

          jest
            .spyOn(shippingUtilsService, "getCityAndStateFromZipCode")
            .mockResolvedValue({ city: "New York", state: "NY" })

          const {
            customer,
            cleanupFunc: customerCleanupFunc,
          } = await testUtils.createTestCustomer(
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

          cleanupFunc = customerCleanupFunc
        }
      )
    }
    runTest(null)
    runTest("Waitlisted")
  })
})
