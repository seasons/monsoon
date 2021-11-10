// describe("Return Items", () => {
//     let reservation
//     let physicalProducts
//     beforeEach(async () => {
//       const { cleanupFunc, customer } = await testUtils.createTestCustomer({
//         select: testCustomerSelect,
//       })
//       cleanupFuncs.push(cleanupFunc)
//       testCustomer = customer
//       reservation = await addToBagAndReserveForCustomer(3)
//       await setReservationStatus(reservation.id, "Delivered")
//       physicalProducts = await prisma.client.physicalProduct.findMany({
//         where: {
//           reservationPhysicalProduct: {
//             some: {
//               reservationId: reservation.id,
//             },
//           },
//         },
//         select: {
//           id: true,
//         },
//       })
//     })

//     it("removes items from customer's bag", async () => {
//       /**
//        * create customer
//        * make reservation
//        * set reservation to delivered
//        * return items
//        * check to see if bagItems have been deleted
//        */
//       const productStates = []

//       for (let physicalProduct of physicalProducts) {
//         productStates.push({
//           productUID: physicalProduct.seasonsUID,
//           returned: true,
//           productStatus: "Dirty",
//           notes: "no notes needed here",
//         })
//       }
//       await resPhysProdService.returnMultiItems({
//         productStates,
//         droppedOffBy: "UPS",
//         trackingNumber: reservation.returnPackage.trackingNumber,
//       })

//       const bagItems = await prisma.client.bagItem.findMany({
//         where: {
//           physicalProduct: {
//             id: {
//               in: physicalProducts.map(a => a.id),
//             },
//           },
//         },
//       })
//       expect(bagItems).toBeNull
//     })

//     it("sets productVariant counts", async () => {
//       /**
//        * create customer
//        * make reservation
//        * set reservation to delivered
//        * return items
//        * check product variant counts
//        */

//       const productStates = []

//       for (let physicalProduct of physicalProducts) {
//         productStates.push({
//           productUID: physicalProduct.seasonsUID,
//           returned: true,
//           productStatus: "Dirty",
//           notes: "no notes needed here",
//         })
//       }
//       await resPhysProdService.returnMultiItems({
//         productStates,
//         droppedOffBy: "UPS",
//         trackingNumber: reservation.returnPackage.trackingNumber,
//       })
//       const productVariants = await prisma.client.productVariant.findMany({
//         where: {
//           physicalProducts: {
//             some: {
//               id: {
//                 in: physicalProducts.map(a => a.id),
//               },
//             },
//           },
//         },
//         select: {
//           nonReservable: true,
//         },
//       })

//       for (const productVariant of productVariants) {
//         expect(productVariant.nonReservable).toBe(
//           productVariant.nonReservable - 1
//         )
//       }
//     })

//     it("sets reservation as complete if all reservation physical products are returned", async () => {
//       /**
//        * create customer
//        * make reservation
//        * set reservation to delivered
//        * return all items on the reservation
//        * check to see if reservation is completed
//        */

//       const productStates = []

//       for (let physicalProduct of physicalProducts) {
//         productStates.push({
//           productUID: physicalProduct.seasonsUID,
//           returned: true,
//           productStatus: "Dirty",
//           notes: "no notes needed here",
//         })
//       }
//       await resPhysProdService.returnMultiItems({
//         productStates,
//         droppedOffBy: "UPS",
//         trackingNumber: reservation.returnPackage.trackingNumber,
//       })
//       const updatedReservation = await prisma.client.reservation.findUnique({
//         where: {
//           id: reservation.id,
//         },
//         select: {
//           status: true,
//         },
//       })

//       expect(updatedReservation.status).toBe("Completed")
//     })

//     it("doesn't set reservation to completed if all reservation physical products items are not returned", async () => {
//       /**
//        * create customer
//        * make reservation
//        * set reservation to delivered
//        * return only one item on the reservation
//        * check to see if reservation is still in status delivered
//        */

//       const productStates = []
//       productStates.push({
//         productUID: physicalProducts[0].seasonsUID,
//         returned: true,
//         productStatus: "Dirty",
//         notes: "no notes needed here",
//       })

//       await resPhysProdService.returnMultiItems({
//         productStates,
//         droppedOffBy: "UPS",
//         trackingNumber: reservation.returnPackage.trackingNumber,
//       })

//       const updatedReservation = await prisma.client.reservation.findUnique({
//         where: {
//           id: reservation.id,
//         },
//         select: {
//           status: true,
//         },
//       })

//       expect(updatedReservation.status).toBe("Delivered")
//     })

//     it("sets droppedOffBy to 'UPS', droppedOffAt and has relevant inbound package if dropped of by ups on reservationPhysicalProducts", async () => {
//       /**
//        * create customer
//        * make reservation
//        * set reservation to delivered (put the returnPackage in the system)
//        * query reservationPhysicalProducts related to reservation, filter them by hasBeenProcessed
//        * check droppedOffAt and inboundPackage on filtered resPhysProds
//        */
//       const productStates = []

//       for (let physicalProduct of physicalProducts) {
//         productStates.push({
//           productUID: physicalProduct.seasonsUID,
//           returned: true,
//           productStatus: "Dirty",
//           notes: "no notes needed here",
//         })
//       }
//       await resPhysProdService.returnMultiItems({
//         productStates,
//         droppedOffBy: "UPS",
//         trackingNumber: reservation.returnPackage.trackingNumber,
//       })

//       const reservationPhysProds = await prisma.client.reservationPhysicalProduct.findMany(
//         {
//           where: {
//             reservationId: reservation.id,
//           },
//           select: {
//             droppedOffAt: true,
//             droppedOffBy: true,
//             inboundPackageId: true,
//           },
//         }
//       )

//       for (const reservationPhysProd of reservationPhysProds) {
//         expect(reservationPhysProd.droppedOffBy).toBe("UPS")
//         expect(!!reservationPhysProd.droppedOffAt).toBe(true)
//         expect(!!reservationPhysProd.inboundPackageId).toBe(true)
//       }
//     })

//     it("sets droppedOffBy to 'Customer' and has no package if dropped off by customer on reservationPhysicalProducts", async () => {
//       /**
//        * create customer
//        * make reservation
//        * set reservation to delivered
//        * query reservationPhysicalProducts related to reservation, filter them by hasBeenProcessed
//        * check droppedOffAt on filtered resPhysProds
//        * check to see if there is no package on filtered resPhysProd
//        */

//       const productStates = []

//       for (let physicalProduct of physicalProducts) {
//         productStates.push({
//           productUID: physicalProduct.seasonsUID,
//           returned: true,
//           productStatus: "Dirty",
//           notes: "no notes needed here",
//         })
//       }
//       await resPhysProdService.returnMultiItems({
//         productStates,
//         droppedOffBy: "Customer",
//       })

//       const reservationPhysProds = await prisma.client.reservationPhysicalProduct.findMany(
//         {
//           where: {
//             reservationId: reservation.id,
//           },
//           select: {
//             droppedOffAt: true,
//             droppedOffBy: true,
//             inboundPackageId: true,
//           },
//         }
//       )

//       for (const reservationPhysProd of reservationPhysProds) {
//         expect(reservationPhysProd.droppedOffBy).toBe("Customer")
//         expect(!!reservationPhysProd.droppedOffAt).toBe(true)
//         expect(reservationPhysProd.inboundPackageId).toBeNull
//       }
//     })

//     it("sets hasReturnProcessed and returnProcessAt on reservationPhysicalProducts", async () => {
//       /**
//        * create customer
//        * make reservation
//        * set reservation to delivered
//        * query reservationPhysicalProducts related to reservation, filter by hasReturnProcessed
//        * check to see if the number of items returned matches the length of the filtered array
//        * check to see if the filtered array has a returnProcessAt
//        */
//       const productStates = []

//       for (let physicalProduct of physicalProducts) {
//         productStates.push({
//           productUID: physicalProduct.seasonsUID,
//           returned: true,
//           productStatus: "Dirty",
//           notes: "no notes needed here",
//         })
//       }
//       await resPhysProdService.returnMultiItems({
//         productStates,
//         droppedOffBy: "UPS",
//         trackingNumber: reservation.returnPackage.trackingNumber,
//       })

//       const reservationPhysProds = await prisma.client.reservationPhysicalProduct.findMany(
//         {
//           where: {
//             reservationId: reservation.id,
//           },
//           select: {
//             hasReturnProcessed: true,
//             returnProcessedAt: true,
//           },
//         }
//       )

//       for (const reservationPhysProd of reservationPhysProds) {
//         expect(reservationPhysProd.hasReturnProcessed).toBe(true)
//         expect(!!reservationPhysProd.returnProcessedAt).toBe(true)
//       }
//     })
// //   })
