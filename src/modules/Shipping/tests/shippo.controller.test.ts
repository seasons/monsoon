import { APP_MODULE_DEF } from "@app/app.module"
import { PushNotificationService } from "@app/modules/PushNotification"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { Reservation } from "@prisma/client"
import request from "supertest"

import { PrismaService } from "../../../prisma/prisma.service"
import { PackageAccepted, TRANSACTION_ID } from "./shippoEvents.stub"

describe("Shippo Controller", () => {
  let app: INestApplication
  let pushNotificationsService: PushNotificationService
  let prismaService: PrismaService
  let testUtils: TestUtilsService
  let testReservation: Partial<Reservation>

  beforeAll(async () => {
    // Create the test module and initalize the app
    const moduleRef = await Test.createTestingModule(APP_MODULE_DEF).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    pushNotificationsService = moduleRef.get<PushNotificationService>(
      PushNotificationService
    )
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    //@ts-ignore

    testReservation = await testUtils.createTestReservation({
      sentPackageTransactionID: TRANSACTION_ID,
      returnPackageTransactionID: "ooglyBoogly",
    })

    // Don't send push notifications
    jest
      .spyOn(pushNotificationsService, "pushNotifyUsers")
      .mockResolvedValue(Promise.resolve({}) as any)

    // Create a test reservation, with one sentPackage and one returnPackage
  })

  describe("Package Accepted event", () => {
    beforeAll(async () => {
      // expect enteredDeliverySystemAt to be null on sent package before sending event
      const testReservationWithData = await prismaService.client.reservation.findFirst(
        {
          where: { id: testReservation.id },
          select: {
            sentPackage: {
              select: { id: true, enteredDeliverySystemAt: true },
            },
          },
        }
      )
      expect(testReservationWithData.sentPackage.enteredDeliverySystemAt).toBe(
        null
      )

      // Send a "Package Accepted" event to the endpoint
      return request(app.getHttpServer())
        .post("/shippo_events")
        .send(PackageAccepted)
        .expect(201)
    })

    it("sets the enteredDeliverySystemAt timestamp on a sent package", async () => {
      expect(null).toBeDefined()
      const testReservationWithData = await prismaService.client.reservation.findFirst(
        {
          where: { id: testReservation.id },
          select: {
            sentPackage: {
              select: { id: true, enteredDeliverySystemAt: true },
            },
          },
        }
      )
      console.log(testReservationWithData.sentPackage.enteredDeliverySystemAt)
      expect(
        testReservationWithData.sentPackage.enteredDeliverySystemAt instanceof
          Date
      ).toBe(true)
    })
  })

  it("sets the deliveredAt timestamp on a return package", done => {
    done()
  })
})
