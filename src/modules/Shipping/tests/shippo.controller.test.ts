import { AppModule } from "@app/app.module"
import { ShippingModule } from "@app/modules"
import { HttpModule, INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"

import { PrismaModule } from "../../../prisma/prisma.module"
import { PrismaService } from "../../../prisma/prisma.service"
import { ShippoController, ShippoData } from "../controllers/shippo.controller"
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
        substatus: data.substatus,
      })
    }),
  }
}

describe("Shippo Controller", () => {
  let app: INestApplication
  let shippoController: ShippoController

  beforeEach(async () => {
    const PrismaServiceProvider = {
      provide: PrismaService,
      useClass: PrismaServiceMock,
    }
    const moduleRef = await Test.createTestingModule({
      controllers: [ShippoController],
      providers: [PrismaServiceProvider],
      imports: [AppModule, ShippingModule, PrismaModule],
    }).compile()

    app = moduleRef.createNestApplication()
    shippoController = moduleRef.get<ShippoController>(ShippoController)
    await app.init()
  })

  it("processes PackageDeparted event", done => {
    return request(app.getHttpServer())
      .post("/shippo_events")
      .send(PackageDeparted)
      .expect(200)
      .end((err, res) => {
        if (err) done(err)
        expect(res).toBe({})
        done()
      })
  })
})
