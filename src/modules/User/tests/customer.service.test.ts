import { CustomerModuleDef } from "@app/modules/Customer/customer.module"
import { EmailService } from "@app/modules/Email/services/email.service"
import { PushNotificationService } from "@app/modules/PushNotification"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { CustomerStatus } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { ApolloError } from "apollo-server"

import { AdmissionsService } from "../services/admissions.service"
import { CustomerService } from "../services/customer.service"

describe.only("Customer Service", () => {
  let customerService: CustomerService
  let prisma: PrismaService
  let testUtils: TestUtilsService
  let admissionsService: AdmissionsService
  let smsService: SMSService
  let emailService: EmailService
  let pushNotificationsService: PushNotificationService

  const mockServiceableZipCodesCheck = () => {
    jest.spyOn(admissionsService, "zipcodeAllowed").mockReturnValue({
      pass: true,
      detail: {
        zipcode: "10004",
        state: "NY",
        allAccessEnabled: true,
        serviceableStates: [],
      },
    })
  }

  const mockSMSFunction = () => {
    const sendSMSFunc = jest
      .spyOn(smsService, "sendSMSById")
      .mockResolvedValue("Delivered")
      .mockClear()

    return sendSMSFunc
  }

  const mockSufficientInventoryCheck = () => {
    jest
      .spyOn(admissionsService, "haveSufficientInventoryToServiceCustomer")
      .mockResolvedValue({
        pass: true,
        detail: {
          availableBottomStyles: [],
          availableTopStyles: [],
          inventoryThreshold: 1,
        },
      })
  }

  const mockbelowWeeklyNewActiveUsersOpsThreshold = () => {
    jest
      .spyOn(admissionsService, "belowWeeklyNewActiveUsersOpsThreshold")
      .mockResolvedValue({ pass: true, detail: "passes" })
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(
      CustomerModuleDef
    ).compile()

    customerService = moduleRef.get<CustomerService>(CustomerService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    admissionsService = moduleRef.get<AdmissionsService>(AdmissionsService)
    const utilsService = moduleRef.get<UtilsService>(UtilsService)
    const queryUtilsService = moduleRef.get<QueryUtilsService>(
      QueryUtilsService
    )
    testUtils = new TestUtilsService(prisma, utilsService, queryUtilsService)
    smsService = moduleRef.get<SMSService>(SMSService)
    emailService = moduleRef.get<EmailService>(EmailService)
    pushNotificationsService = moduleRef.get<PushNotificationService>(
      PushNotificationService
    )
  })

  xdescribe("Update Customer Details", () => {
    test.each([
      ["Invited", true],
      ["Invited", false],
      ["Waitlisted", true],
      ["Waitlisted", false],
      ["Created", false],
    ])(
      "Successfully updates customer details: (old status: %p, authorized: %p)",
      async (oldStatus, authorized) => {
        mockServiceableZipCodesCheck()
        mockSufficientInventoryCheck()
        const sendSMSFunc = mockSMSFunction()
        const sendAuthorizedEmail = jest
          .spyOn(emailService, "sendAuthorizedEmail")
          .mockResolvedValue()
        const pushNotifyUsers = jest
          .spyOn(pushNotificationsService, "pushNotifyUsers")
          .mockResolvedValue({} as any)

        const { customer, cleanupFunc } = await testUtils.createTestCustomer(
          {
            detail: {},
            status: oldStatus as CustomerStatus,
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
            email
          }
        }`,
          null
        )

        if (authorized) {
          if (oldStatus == "Waitlisted") {
            // Had some issues hooking up the RenderEmail stuff from wind
            expect(sendAuthorizedEmail).toBeCalledTimes(1)
          } else if (oldStatus == "Invited") {
            const emailReceipts = await prisma.client2.emailReceipt.findMany({
              where: {
                user: { id: newCustomer.user.id },
              },
            })
            expect(emailReceipts.length).toEqual(1)
            expect(emailReceipts[0].emailId).toEqual("PriorityAccess")
          }
          expect(sendSMSFunc).toBeCalledTimes(1)
          expect(pushNotifyUsers).toBeCalledWith({
            emails: [newCustomer.user.email],
            pushNotifID: "CompleteAccount",
          })
        }

        expect(newCustomer.plan).toEqual(newPlan)

        await prisma.client2.pushNotificationReceipt.deleteMany({
          where: { users: { some: { id: newCustomer.user.id } } },
        })
        await prisma.client2.emailReceipt.deleteMany({
          where: { user: { id: newCustomer.user.id } },
        })
        await cleanupFunc()
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

        const { customer, cleanupFunc } = await testUtils.createTestCustomer({
          status: "Created",
        })

        const user = await prisma.client2.user.findUnique({
          where: { id: customer.user.id },
        })
        const newCustomer: any = await customerService.addCustomerDetails(
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
          {
            id: true,
            status: true,
            detail: true,
          }
        )

        expect(newCustomer.detail.topSizes).toEqual(topSizes)
        expect(newCustomer.detail.waistSizes).toEqual(waistSizes)
        expect(newCustomer.detail.weight).toEqual(weight)
        expect(newCustomer.detail.height).toEqual(height)

        expect(newCustomer.status).toEqual(status ? status : "Created")

        await cleanupFunc()
      }
    )
  })

  describe("Triage Customer", () => {
    let cleanupFunc

    afterEach(async () => {
      await cleanupFunc?.()
    })

    it("Throws on status not triageable", async () => {
      const {
        customer,
        cleanupFunc: customerCleanupFunc,
      } = await testUtils.createTestCustomer({
        detail: {},
        status: "Authorized",
      })
      expect(
        customerService.triageCustomer({ id: customer.id }, null, false)
      ).rejects.toThrowError(ApolloError)

      cleanupFunc = customerCleanupFunc
    })

    it("Updates customer to Authorized", async () => {
      mockServiceableZipCodesCheck()
      mockSufficientInventoryCheck()
      mockbelowWeeklyNewActiveUsersOpsThreshold()

      const {
        customer,
        cleanupFunc: customerCleanupFunc,
      } = await testUtils.createTestCustomer(
        { detail: {}, status: "Created" },
        {
          id: true,
          status: true,
          user: {
            select: {
              id: true,
            },
          },
        }
      )

      const result = await customerService.triageCustomer(
        { id: customer.id },
        null,
        true
      )
      expect(result.status).toEqual("Authorized")

      cleanupFunc = customerCleanupFunc
    })
  })
})
