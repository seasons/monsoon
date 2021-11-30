import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const createReservationPhysicalProduct = async () => {}

const migrateToRpp = async () => {
  const ps = new PrismaService()

  const allActiveCustomers = await ps.client.customer.findMany({
    where: {
      OR: [
        { status: { in: ["Active", "PaymentFailed"] } },
        {
          reservations: {
            some: {
              status: {
                in: [
                  "Queued",
                  "Packed",
                  "Picked",
                  "Delivered",
                  "Hold",
                  "ReturnPending",
                  "Shipped",
                ],
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      reservations: { select: { id: true }, orderBy: { createdAt: "asc" } },
    },
  })
  const customersToMigrate = allActiveCustomers.filter(
    a => a.reservations.length > 0
  )
  for (const cust of customersToMigrate) {
  }
}

const run = async () => {
  /*
    Query all customers with at least one reservation record. 
        Order their reservations by createdAt date.
        For each reservation, 
            create reservation physical products only for the newProducts.
            if there are products that are carried over from a previous resy, 
                get the reservation physical products from that resy and connect them. 


    Logic to create a reservation physical product:
        isNew: true if the product is in the newProducts array
        status: TK 
        pickedAt: can't set
        packedAt: can't set
        isOnHold: it's a new Product and the reservation status is Hold
        hasReturnProcessed: There is a reservationReceiptItem record for this product. 
        returnProcessedAt: If the above is true, the createdAt time for the relevant ReservationReceipt record. 

        hasBeenResetEarlyByAdmin -- can't set
        hasCustomerReturnIntent -- can't set

        hasBeenLost:
            -> underlying physical product has product status lost
            -> no other reservation after this one for another customer has this item
        lostAt: 
            -> no way to know.
        lostInPhase:
            -> no way to know. 

        hasBeenDeliveredToCustomer/deliveredToCustomerAt:
            -> Check outbound package for the item. If that has a deliveredAt timestamp, then it's been delivered. 
                 -> timestamp is package timestamp.
            -> Or if the resy is Completed, ReturnPending, or Delivered. 
                -> timestamp unknown.
            -> Or if the resy is Lost and lostInPhase is CustomerToBusiness
                -> timestamp unknown.
        
        hasBeenDeliveredToBusiness:
            -> It's on an inbound package for the customer that has a deliveredAt timestamp.
                -> timestamp is package timestamp.
            -> Or if hasReturnProcessed is true. timestamp is unknown. 
    

        hasBeenScannedOnOutbound:
            -> outbound package has entered the delivery system. use timestamp.
        
        hasBeenScannedOnInbound:
            -> Inbound package has entered the delivery system. use timestamp.

        inbound/outboundpackage : easy

        physicalProduct: duh 

        customer: duh

        reservation: duh

        bagItem:
            If the customer has a bag item for this physical product that has status reserved, connect it. 

        rentalInvoices:
            -> Find a rental invoice with the reservation in question and the physical product in question. 
            -> If that exists, connect it. 

        shippingMethod:
            -> Shipping method of reservation.
  */
}
run()
