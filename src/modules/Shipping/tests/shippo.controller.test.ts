import { PushNotificationService } from "@app/modules/PushNotification"
import { PushNotificationModule } from "@app/modules/PushNotification/pushNotification.module"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"

import { PrismaService } from "../../../prisma/prisma.service"
import { ShippoController } from "../controllers/shippo.controller"
import { PackageDeparted } from "./shippoEvents.stub"

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
      user: () =>
        Promise.resolve({
          id: "789",
          pushNotification: {
            status: "Granted",
          },
        }),
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
    reservation: () => ({
      id: "123",
      user: () => ({
        id: "789",
      }),
    }),
    packages: () => [
      {
        transactionID: "cab8f46684034257ba8d72c58347fc26",
      },
    ],
    updateReservation: jest.fn(),
    pushNotificationReceipts: jest.fn(),
    updatePackage: jest.fn(),
  }
}

describe("Shippo Controller", () => {
  let app: INestApplication
  let pushNotificationsService: PushNotificationService

  beforeEach(async () => {
    const PrismaServiceProvider = {
      provide: PrismaService,
      useClass: PrismaServiceMock,
    }
    const moduleRef = await Test.createTestingModule({
      controllers: [ShippoController],
      providers: [ShippoController, PrismaServiceProvider],
      imports: [PushNotificationModule],
    })
      .overrideProvider(PrismaService)
      .useClass(PrismaServiceMock)
      .compile()

    app = moduleRef.createNestApplication()
    pushNotificationsService = moduleRef.get<PushNotificationService>(
      PushNotificationService
    )

    await app.init()
  })

  it("processes PackageDeparted event", done => {
    jest
      .spyOn(pushNotificationsService, "pushNotifyUsers")
      .mockResolvedValue({})
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
