// import * as Airtable from "airtable"
// import { ReservationService } from "@modules/Product/services/reservation.service"
// import { PrismaService } from "@prisma/prisma.service"
// import { TestUtilsService } from "@modules/Utils/services/test.service"
// import { User, Customer } from "@prisma/index"
// import {
//   AirtableBaseService,
//   AirtableService,
//   AirtableUtilsService,
// } from "@modules/Airtable"
// import { ReservationScheduledJobs } from ".."
// import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
// import { EmailService, EmailDataProvider } from "@app/modules/Email"
// import { UtilsService } from "@app/modules/Utils/services/utils.service"
// import { ErrorService } from "@app/modules/Error/services/error.service"
// import { head, isEqual } from "lodash"

// describe("Return Flow Cron Job", () => {
//   let reservationService: ReservationService
//   let prismaService: PrismaService
//   let testUtilsService: TestUtilsService
//   let testUser: User
//   let testCustomer: Customer
//   let reservableProductVariants
//   let reservationJobsService: ReservationScheduledJobs
//   let airtableService: AirtableService

//   beforeAll(async () => {
//     Airtable.configure({
//       endpointUrl: "https://api.airtable.com",
//       apiKey: process.env.AIRTABLE_KEY,
//     })

//     prismaService = new PrismaService()

//     const airtableBaseService = new AirtableBaseService()
//     airtableService = new AirtableService(
//       airtableBaseService,
//       new AirtableUtilsService(airtableBaseService)
//     )

//     testUtilsService = new TestUtilsService(prismaService, airtableService)
//     ;({ reservationService } = testUtilsService.createReservationService())

//     const utilsService = new UtilsService(prismaService)
//     reservationJobsService = new ReservationScheduledJobs(
//       airtableService,
//       new EmailService(prismaService, utilsService, new EmailDataProvider()),
//       prismaService,
//       new ShippingService(prismaService, utilsService),
//       new ErrorService()
//     )
//   })

//   beforeEach(async () => {
//     const { user, customer } = await testUtilsService.createNewTestingCustomer()
//     testUser = user
//     testCustomer = customer
//     reservableProductVariants = await prismaService.client.productVariants({
//       where: {
//         reservable_gt: 0,
//         physicalProducts_every: { inventoryStatus: "Reservable" },
//       },
//     })
//   })

//   afterEach(async () => {
//     await prismaService.client.deleteCustomer({ id: testCustomer.id })
//     await prismaService.client.deleteUser({ id: testUser.id })
//   })

//   describe("sync physical product status", () => {
//     it("update prisma status and counts. update airtable counts", async () => {
//       // Ensure the prisma product variant and airtable product variant are synced before running
//       const testPrismaProdVar = head(
//         await prismaService.client.productVariants()
//       )
//       const testAirtableProdVar = airtableService.getCorrespondingAirtableProductVariant(
//         await airtableService.getAllProductVariants(),
//         testPrismaProdVar
//       )
//       if (
//         !isEqual(
//           {
//             total: testPrismaProdVar.total,
//             reserved: testPrismaProdVar.reserved,
//             reservable: testPrismaProdVar.reservable,
//             nonReservabe: testPrismaProdVar.nonReservable,
//             status: testPrismaProdVar.
//           },
//           {
//             total: testAirtableProdVar.model.total,
//             reserved: testAirtableProdVar.model.reserved,
//             reservable: testAirtableProdVar.model.reservable,
//             nonReservable: testAirtableProdVar.model.nonReservable,
//           }
//         )
//       ) {
//       }
//       // Edit the airtable product variant
//       // Run the cron job
//       // Confirm it changed
//     })
//   })

//   describe("sync reservation status", () => {
//     it("properly returns an item, including bag item deletions, feedback survey data creation, status updating, return package updating", async () => {})
//   })
// })
