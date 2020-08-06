import { UtilsModule } from "@app/modules/Utils/utils.module"
import { PrismaModule } from "@app/prisma/prisma.module"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"

import { PrismaService } from "../../../prisma/prisma.service"
import { AdmissionsService } from "../services/admissions.service"

class PrismaServiceMock {
  binding = {
    query: {
      emailReceipts: () =>
        Promise.resolve([
          {
            emailId: "WelcomeToSeasons",
            createdAt: "2019-10-31 21:04:52.03",
            user: { id: "1" },
          },
          {
            emailId: "CompleteAccount",
            createdAt: "2019-10-31 21:04:52.03",
            user: { id: "1" },
          },
          {
            emailId: "PriorityAccess",
            createdAt: "2019-10-31 21:04:52.03",
            user: { id: "1" },
          },
        ]),
    },
  }
  client = {}
}

describe("Admissions Service", () => {
  let app: INestApplication
  let prismaService: PrismaService
  let admissions: AdmissionsService
  let expectAdmit
  let expectNotAdmit

  beforeAll(async () => {
    const PrismaServiceProvider = {
      provide: PrismaService,
      useClass: PrismaServiceMock,
    }
    const moduleRef = await Test.createTestingModule({
      providers: [AdmissionsService],
      imports: [PrismaModule, UtilsModule],
    })
      .overrideProvider(PrismaService)
      .useClass(PrismaServiceMock)
      .compile()

    app = moduleRef.createNestApplication()
    admissions = moduleRef.get<AdmissionsService>(AdmissionsService)
    prismaService = moduleRef.get<PrismaService>(PrismaService)

    expectAdmit = (zipcode: string) =>
      expect(admissions.weServiceZipcode(zipcode)).toBe(true)
    expectNotAdmit = (zipcode: string) =>
      expect(admissions.weServiceZipcode(zipcode)).toBe(false)
    await app.init()
  })

  describe("Serviceable Zipcodes", () => {
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
    it("Returns false if we've activated too many users", () => {
      expect(1).toBe(0)
    })

    it("Returns false if we've sent out too many invitations", () => {
      expect(1).toBe(0)
    })

    it("Returns true if we're below the threshold", () => {
      expect(1).toBe(0)
    })
  })
})
