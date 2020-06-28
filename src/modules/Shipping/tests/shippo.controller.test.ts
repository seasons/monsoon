import { AppModule } from "@app/app.module"
import { INestApplication } from "@nestjs/common"
import { ContextIdFactory } from "@nestjs/core"
import { Test } from "@nestjs/testing"
import request from "supertest"

import { PrismaModule } from "../../../prisma/prisma.module"
import { PrismaService } from "../../../prisma/prisma.service"
import { ShippoController } from "../controllers/shippo.controller"
import { PackageArrived, PackageDeparted } from "./shippoEvents.stub"

class PrismaServiceMock {
  binding = {
    query: {
      reservations: () =>
        Promise.resolve([
          {
            id: "123",
            sentPackage: {
              transactionID: "cab8f46684034257ba8d72c58347fc26",
            },
          },
        ]),
    },
  }

  client = {
    createPackageTransitEvent: jest.fn().mockImplementation(data => {
      return Promise.resolve({
        id: "456",
        status: data.status,
        substatus: data.subStatus,
        data,
      })
    }),
    updateReservation: jest.fn(),
  }
}

describe("Shippo Controller", () => {
  let app: INestApplication
  let shippoController: ShippoController
  let prismaService: PrismaService

  beforeEach(async () => {
    const PrismaServiceProvider = {
      provide: PrismaService,
      useClass: PrismaServiceMock,
    }
    const moduleRef = await Test.createTestingModule({
      controllers: [ShippoController],
      providers: [ShippoController, PrismaServiceProvider],
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useClass(PrismaServiceMock)
      .compile()

    app = moduleRef.createNestApplication()
    shippoController = moduleRef.get<ShippoController>(ShippoController)
    prismaService = moduleRef.get<PrismaService>(PrismaService)

    await app.init()
  })

  it("processes PackageDeparted event", done => {
    return request(app.getHttpServer())
      .post("/shippo_events")
      .send(PackageDeparted)
      .expect(201)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).toMatchObject({
          id: "456",
          status: "Transit",
          substatus: "PackageDeparted",
        })
        done()
      })
  })
})
