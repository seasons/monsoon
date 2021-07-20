import { SMSService } from "@app/modules/SMS/services/sms.service"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { UtilsModule } from "@app/modules/Utils/utils.module"
import {
  CreateTestCustomerInput,
  CreateTestProductInput,
} from "@app/modules/Utils/utils.types"
import { EmailId, InventoryStatus, ProductType } from "@app/prisma"
import { PrismaModule } from "@app/prisma/prisma.module"
import { Test } from "@nestjs/testing"
import { fill } from "lodash"

import { PrismaService } from "../../../prisma/prisma.service"
import { AdmissionsService } from "../services/admissions.service"

describe("Admissions Service", () => {
  let admissions: AdmissionsService
  let expectNotAdmit
  let expectAdmitWithAllAccessEnabled
  let expectAdmitWithAllAccessDisabled

  beforeAll(async () => {
    admissions = await createTestAdmissionsService(null)
  })

  describe("Serviceable Zipcodes", () => {
    beforeAll(() => {
      expectAdmitWithAllAccessEnabled = (zipcode: string) => {
        const { pass, detail } = admissions.zipcodeAllowed(zipcode)
        expect(pass).toBe(true)
        expect(detail.allAccessEnabled).toBe(true)
      }

      expectAdmitWithAllAccessDisabled = (zipcode: string) => {
        const { pass, detail } = admissions.zipcodeAllowed(zipcode)
        expect(pass).toBe(true)
        expect(detail.allAccessEnabled).toBe(false)
      }

      expectNotAdmit = (zipcode: string) =>
        expect(admissions.zipcodeAllowed(zipcode).pass).toBe(false)
    })

    it("admits New York with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("11432"))

    it("admits Pennsylvania with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("15001"))

    it("admits New Jersey with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("07001"))

    it("admits Delaware with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("19701"))

    it("admits Maryland with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("20588"))

    it("admits Massachusetts with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("01001"))

    it("admits New Hampshire with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("03031"))

    it("admits Vermont with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("05001"))

    it("admits Washington D.C. with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("20011"))

    it("admits Maine with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("03901"))

    it("admits Virginia with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("20101"))

    it("admits Ohio with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("43001"))

    it("admits West Virginia with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("24701"))

    it("admits Michigan with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("49036"))

    it("admits North Carolina with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("27565"))

    it("admits Connecticut with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("06101"))

    it("admits Rhode Island with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("02840"))

    it("admits Indiana with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("46201"))

    it("admits Kentucky with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("41701"))

    it("admits Tennessee with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("37201"))

    it("admits South Carolina with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("29020"))

    it("admits Georgia with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("30301"))

    it("admits Illinois with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("60601"))

    it("admits Alabama with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("35004"))

    it("does not admit Alaska", () => expectNotAdmit("99501"))

    it("admits Arizona with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("85001"))

    it("admits Arkansas with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("72201"))

    it("admits California with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("90001"))

    it("admits Colorado with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("80201"))

    it("admits Florida with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("33124"))

    it("does not admit Hawaii", () => expectNotAdmit("96801"))

    it("admits Idaho with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("83254"))

    it("admits Iowa with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("52801"))

    it("admits Kansas with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("67201"))

    it("admits Louisiana with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("70112"))

    it("admits Minnesota with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("55801"))

    it("admits Mississippi with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("39530"))

    it("admits Missouri with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("63101"))

    it("admits Montana with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("59044"))

    it("admits Nebraska with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("68901"))

    it("admits Nevada with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("89501"))

    // TODO: Get this to pass with 87500. Thats Sante Fe, NM.
    // Currently it is unable to get the state for that zipcode
    it("admits New Mexico with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("87102"))

    it("admits North Dakota with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("58282"))

    it("admits Oklahoma with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("74101"))

    it("admits Oregon with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("97201"))

    it("admits South Dakota with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("57401"))

    it("admits Texas with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("78701"))

    it("admits Washington with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("98004"))

    it("admits Wisconsin with All Access Enabled", () =>
      expectAdmitWithAllAccessEnabled("53201"))

    it("admits Wyoming with All Access Disabled", () =>
      expectAdmitWithAllAccessDisabled("82941"))
  })

  describe("Ops Threshold", () => {
    it("Returns false if we've activated too many users", async () => {
      class PrismaServiceMockElevenAccountActivations {
        binding = {
          query: {
            emailReceipts: () =>
              Promise.resolve(
                createEmailReceipts(
                  {
                    1: 2,
                    2: 4,
                    6: 5,
                    20: 10,
                  },
                  "WelcomeToSeasons"
                )
              ),
          },
        }
        client = {}
      }

      process.env["WEEKLY_NEW_USERS_THRESHOLD"] = "10"
      const admissions = await createTestAdmissionsService(
        PrismaServiceMockElevenAccountActivations
      )

      const {
        pass,
        detail,
      } = await admissions.belowWeeklyNewActiveUsersOpsThreshold()
      expect(pass).toBe(false)
    })

    it("Returns false if we've sent out too many invitations", async () => {
      class PrismaServiceMockTwentyOneAccountActivations {
        binding = {
          query: {
            emailReceipts: () =>
              Promise.resolve([
                ...createEmailReceipts(
                  {
                    3: 10,
                    1: 1,
                    2: 2,
                    5: 1,
                    6: 5,
                  },
                  "CompleteAccount"
                ),
                ...createEmailReceipts(
                  {
                    4: 2,
                  },
                  "PriorityAccess"
                ),
              ]),
          },
        }
        client = {}
      }

      process.env["WEEKLY_INVITATIONS_THRESHOLD"] = "20"
      const admissions = await createTestAdmissionsService(
        PrismaServiceMockTwentyOneAccountActivations
      )

      const {
        pass,
        detail,
      } = await admissions.belowWeeklyNewActiveUsersOpsThreshold()
      expect(pass).toBe(false)
    })

    it("Returns true if we're below both thresholds", async () => {
      class PrismaServiceMockNoInvitationsOrAccountActiviations {
        binding = {
          query: {
            emailReceipts: () => Promise.resolve([]),
          },
        }
        client = {}
      }

      process.env["WEEKLY_NEW_USERS_THRESHOLD"] = "1"
      process.env["WEEKLY_INVITATIONS_THRESHOLD"] = "1"
      const admissions = await createTestAdmissionsService(
        PrismaServiceMockNoInvitationsOrAccountActiviations
      )

      const {
        pass,
        detail,
      } = await admissions.belowWeeklyNewActiveUsersOpsThreshold()
      expect(pass).toBe(true)
    })
  })

  describe("Inventory Threshold", () => {
    let testUtils: TestUtilsService
    let utils: UtilsService
    let prismaService: PrismaService
    let cleanupFuncs = []
    let allTestProductsToCreate: CreateTestProductInput[]
    let topXSReservable
    let topSReservable
    let topMReservable
    let bottom30Reservable
    let bottom31Reservable
    let bottom35Reservable
    let topXSNonReservable
    let bottom31Stored
    let bottom30OneReservableOneNonReservable
    let testCustomer

    beforeAll(() => {
      let ps = (prismaService = new PrismaService())
      const qus = new QueryUtilsService(ps)
      testUtils = new TestUtilsService(ps, new UtilsService(ps, qus), qus)
      utils = new UtilsService(ps, qus)

      // reservable products
      topXSReservable = createTestProductCreateInput("Top", "XS", "Reservable")
      topSReservable = createTestProductCreateInput("Top", "S", "Reservable")
      topMReservable = createTestProductCreateInput("Top", "M", "Reservable")
      bottom30Reservable = createTestProductCreateInput(
        "Bottom",
        "30",
        "Reservable"
      )
      bottom31Reservable = createTestProductCreateInput(
        "Bottom",
        "31",
        "Reservable"
      )
      bottom35Reservable = createTestProductCreateInput(
        "Bottom",
        "35",
        "Reservable"
      )
      bottom30OneReservableOneNonReservable = {
        type: "Bottom",
        variants: [
          {
            displayShort: "30",
            physicalProducts: [
              { inventoryStatus: "Reservable" },
              { inventoryStatus: "NonReservable" },
            ],
          },
        ],
      } as CreateTestProductInput

      // non reservable products
      topXSNonReservable = createTestProductCreateInput(
        "Top",
        "XS",
        "NonReservable"
      )
      bottom31Stored = createTestProductCreateInput("Bottom", "31", "Stored")

      // All the test products we create
      allTestProductsToCreate = [
        // 12 styles available for him. 11 are 100% reservable.
        // 1 has 1 reserved unit, 1 nonreservable unit
        ...fill(Array(4), topXSReservable),
        ...fill(Array(4), topSReservable),
        ...fill(Array(2), bottom30Reservable),
        bottom31Reservable,
        bottom30OneReservableOneNonReservable,
        // some styles that are reservable but not in his size
        ...fill(Array(4), bottom35Reservable),
        ...fill(Array(4), topMReservable),
        // some styles that are in his size but not reservable
        ...fill(Array(2), topXSNonReservable),
        ...fill(Array(2), bottom31Stored),
      ]
    })

    beforeEach(async () => {
      for (const testProdToCreate of allTestProductsToCreate) {
        const { cleanupFunc } = await testUtils.createTestProduct(
          testProdToCreate
        )
        cleanupFuncs.push(cleanupFunc)
      }

      // Create test user
      const {
        cleanupFunc: customerCleanUpFunc,
        customer,
      } = await testUtils.createTestCustomer({
        detail: { topSizes: ["XS", "S"], waistSizes: [30, 31], phoneOS: "iOS" },
      })
      cleanupFuncs.push(customerCleanUpFunc)
      testCustomer = customer
    })

    afterEach(async () => {
      for (const func of cleanupFuncs) {
        await func()
      }
      cleanupFuncs = []
    })

    it("correctly calculates the available inventory for a user with no competing users", async () => {
      const {
        reservableStyles,
      } = await admissions.reservableInventoryForCustomer({
        id: testCustomer.id,
      })
      expect(reservableStyles).toBe(12)
    })

    it("correctly calculates the available inventory for a user with competing paused users", async () => {
      const testCustomerInputs = [
        // paused, but not resuming within the next week and therefore not competing
        {
          status: "Paused",
          detail: { topSizes: ["XS"], waistSizes: [30, 31], phoneOS: "iOS" },
          membership: {
            pauseRequests: [
              {
                notified: false,
                pausePending: false,
                pauseDate: utils.xDaysAgoISOString(22),
                resumeDate: utils.xDaysFromNowISOString(8),
                pauseType: "WithItems",
              },
            ],
          },
        },
        // paused, resuming in the next week, competing
        {
          status: "Paused",
          detail: { topSizes: ["XS"], waistSizes: [30, 31], phoneOS: "iOS" },
          membership: {
            // put a few pause requests to test the code that retrieves the latest one
            pauseRequests: [
              {
                notified: true,
                pausePending: false,
                pauseDate: utils.xDaysAgoISOString(356),
                resumeDate: utils.xDaysAgoISOString(326),
              },
              {
                notified: true,
                pausePending: false,
                pauseDate: utils.xDaysAgoISOString(120),
                resumeDate: utils.xDaysAgoISOString(90),
              },
              {
                notified: false,
                pausePending: false,
                pauseDate: utils.xDaysAgoISOString(24),
                resumeDate: utils.xDaysFromNowISOString(6),
              },
            ],
          },
        },
      ] as CreateTestCustomerInput[]
      for (const input of testCustomerInputs) {
        const { cleanupFunc } = await testUtils.createTestCustomer(input)
        cleanupFuncs.push(cleanupFunc)
      }

      const {
        reservableStyles,
      } = await admissions.reservableInventoryForCustomer({
        id: testCustomer.id,
      })
      expect(reservableStyles).toBe(9) // 6.5 available top styles, 2.5 available bottom styles
    }, 20000)

    it("correctly calculates the available inventory for a user with competing active users", async () => {
      const testCustomerInputs = [
        // shares a top size, doesn't share a bottom size
        { status: "Active", detail: { topSizes: ["S"], waistSizes: [33, 34] } },
        // doesn't share a top size, shares a bottom size
        { status: "Active", detail: { topSizes: ["M"], waistSizes: [30, 29] } },
        // shares a top size, shares both bottom sizes
        {
          status: "Active",
          detail: { topSizes: ["XS"], waistSizes: [30, 31] },
        },
      ] as CreateTestCustomerInput[]

      for (const input of testCustomerInputs) {
        const { cleanupFunc } = await testUtils.createTestCustomer(input)
        cleanupFuncs.push(cleanupFunc)
      }

      const {
        reservableStyles,
      } = await admissions.reservableInventoryForCustomer({
        id: testCustomer.id,
      })
      expect(reservableStyles).toBe(6)
    })

    it("does not admit a user with insufficient available inventory", async () => {
      process.env.MIN_RESERVABLE_INVENTORY_PER_CUSTOMER = "15"

      const {
        pass,
      } = await admissions.haveSufficientInventoryToServiceCustomer({
        id: testCustomer.id,
      })
      expect(pass).toBe(false)
    })

    it("admits a user with sufficient inventory", async () => {
      process.env.MIN_RESERVABLE_INVENTORY_PER_CUSTOMER = "11"

      const {
        pass,
      } = await admissions.haveSufficientInventoryToServiceCustomer({
        id: testCustomer.id,
      })
      expect(pass).toBe(true)
    })
  })
})

const createTestAdmissionsService = async (
  prismaServiceMockClass
): Promise<AdmissionsService> => {
  let moduleBuilder = Test.createTestingModule({
    providers: [AdmissionsService],
    imports: [PrismaModule, UtilsModule],
  })
  if (!!prismaServiceMockClass) {
    moduleBuilder
      .overrideProvider(PrismaService)
      .useClass(prismaServiceMockClass)
  }
  const moduleRef = await moduleBuilder.compile()

  const admissions = moduleRef.get<AdmissionsService>(AdmissionsService)
  return admissions
}

const createEmailReceipts = (
  emailsSentXDaysAgoObject,
  emailId: EmailId
): Array<any> => {
  const utils = new UtilsService(null, null)

  return Object.keys(emailsSentXDaysAgoObject).reduce(
    (emailReceipts, currentKey) => {
      let i = 1
      while (i <= emailsSentXDaysAgoObject[currentKey]) {
        emailReceipts.push({
          emailId,
          createdAt: utils.xDaysAgoISOString(parseInt(currentKey, 10)),
          user: { id: utils.randomString() },
        })
        i++
      }
      return emailReceipts
    },
    []
  )
}

const createTestProductCreateInput = (
  type: ProductType,
  sizeString: string,
  inventoryStatus: InventoryStatus
) => {
  const input = {
    type,
    variants: [
      {
        displayShort: sizeString,
        physicalProducts: [{ inventoryStatus }],
      },
    ],
  } as CreateTestProductInput

  switch (type) {
    case "Top":
      break
    case "Bottom":
      break
    default:
      throw new Error(`invalid product type: ${type}`)
  }
  return input
}
