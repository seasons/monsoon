import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { UtilsModule } from "@app/modules/Utils/utils.module"
import {
  CreateTestCustomerInput,
  CreateTestProductInput,
} from "@app/modules/Utils/utils.types"
import { EmailId, InventoryStatus, LetterSize, ProductType } from "@app/prisma"
import { PrismaModule } from "@app/prisma/prisma.module"
import { Test } from "@nestjs/testing"
import { fill } from "lodash"

import { PrismaService } from "../../../prisma/prisma.service"
import { AdmissionsService } from "../services/admissions.service"

describe("Admissions Service", () => {
  let admissions: AdmissionsService
  let expectAdmit
  let expectNotAdmit

  beforeAll(async () => {
    admissions = await createTestAdmissionsService(null)
  })

  describe("Serviceable Zipcodes", () => {
    beforeAll(() => {
      expectAdmit = (zipcode: string) =>
        expect(admissions.zipcodeAllowed(zipcode).pass).toBe(true)
      expectNotAdmit = (zipcode: string) =>
        expect(admissions.zipcodeAllowed(zipcode).pass).toBe(false)
    })

    it("admits New York", () => expectAdmit("11432"))

    it("admits Pennsylvania", () => expectAdmit("15001"))

    it("admits New Jersey", () => expectAdmit("07001"))

    it("admits Delaware", () => expectAdmit("19701"))

    it("admits Maryland", () => expectAdmit("20588"))

    it("admits Massachusetts", () => expectAdmit("01001"))

    it("admits New Hampshire", () => expectAdmit("03031"))

    it("admits Vermont", () => expectAdmit("05001"))

    it("admits Washington D.C.", () => expectAdmit("20011"))

    it("admits Maine", () => expectAdmit("03901"))

    it("admits Virginia", () => expectAdmit("20101"))

    it("admits Ohio", () => expectAdmit("43001"))

    it("admits West Virginia", () => expectAdmit("24701"))

    it("admits Michigan", () => expectAdmit("49036"))

    it("admits North Carolina", () => expectAdmit("27565"))

    it("admits Connecticut", () => expectAdmit("06101"))

    it("admits Rhode Island", () => expectAdmit("02840"))

    it("admits Indiana", () => expectAdmit("46201"))

    it("admits Kentucky", () => expectAdmit("41701"))

    it("admits Tennessee", () => expectAdmit("37201"))

    it("admits South Carolina", () => expectAdmit("29020"))

    it("admits Georgia", () => expectAdmit("30301"))

    it("admits Illinois", () => expectAdmit("60601"))

    it("does not admit Alabama", () => expectNotAdmit("35004"))

    it("does not admit Alaska", () => expectNotAdmit("99501"))

    it("does not admit Arizona", () => expectNotAdmit("85001"))

    it("does not admit Arkansas", () => expectNotAdmit("72201"))

    it("does not admit California", () => expectNotAdmit("90001"))

    it("does not admit Colorado", () => expectNotAdmit("80201"))

    it("does not admit Florida", () => expectNotAdmit("33124"))

    it("does not admit Hawaii", () => expectNotAdmit("96801"))

    it("does not admit Idaho", () => expectNotAdmit("83254"))

    it("does not admit Iowa", () => expectNotAdmit("52801"))

    it("does not admit Kansas", () => expectNotAdmit("67201"))

    it("does not admit Louisiana", () => expectNotAdmit("70112"))

    it("does not admit Minnesota", () => expectNotAdmit("55801"))

    it("does not admit Mississippi", () => expectNotAdmit("39530"))

    it("does not admit Missouri", () => expectNotAdmit("63101"))

    it("does not admit Montana", () => expectNotAdmit("59044"))

    it("does not admit Nebraska", () => expectNotAdmit("68901"))

    it("does not admit Nevada", () => expectNotAdmit("89501"))

    it("does not admit New Mexico", () => expectNotAdmit("87500"))

    it("does not admit North Dakota", () => expectNotAdmit("58282"))

    it("does not admit Oklahoma", () => expectNotAdmit("74101"))

    it("does not admit Oregon", () => expectNotAdmit("97201"))

    it("does not admit South Dakota", () => expectNotAdmit("57401"))

    it("does not admit Texas", () => expectNotAdmit("78701"))

    it("does not admit Washington", () => expectNotAdmit("98004"))

    it("does not admit Wisconsin", () => expectNotAdmit("53201"))

    it("does not admit Wyoming", () => expectNotAdmit("82941"))
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
      const ps = new PrismaService()
      testUtils = new TestUtilsService(ps, new UtilsService(ps))
      utils = new UtilsService(ps)

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
            internalSize: { display: "30" },
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

    it("does not admit a user with an unsupported platform", async () => {
      const { customer } = await testUtils.createTestCustomer({
        detail: {
          topSizes: ["XS", "S"],
          waistSizes: [30, 31],
          phoneOS: "Android",
        },
      })

      const { pass } = await admissions.hasSupportedPlatform(
        {
          id: customer.id,
        },
        "flare"
      )
      expect(pass).toBe(false)
    })

    it("admits a user with a supported platform", async () => {
      const { customer } = await testUtils.createTestCustomer({
        detail: { topSizes: ["XS", "S"], waistSizes: [30, 31], phoneOS: "iOS" },
      })

      const { pass } = await admissions.hasSupportedPlatform(
        {
          id: customer.id,
        },
        "flare"
      )
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
  const utils = new UtilsService(null)

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
  sizeString: String | LetterSize,
  inventoryStatus: InventoryStatus
) => {
  let input = {
    type,
    variants: [
      {
        internalSize: { display: sizeString },
        physicalProducts: [{ inventoryStatus }],
      },
    ],
  } as CreateTestProductInput

  switch (type) {
    case "Top":
      input.variants[0].internalSize.top = { letter: sizeString as LetterSize }
      break
    case "Bottom":
      break
    default:
      throw new Error(`invalid product type: ${type}`)
  }
  return input
}
