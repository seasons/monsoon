-- CreateEnum
CREATE TYPE "ReservationDropOffAgent" AS ENUM ('Customer', 'UPS');

-- CreateTable
CREATE TABLE "ReservationPhysicalProduct" (
    "id" VARCHAR(30) NOT NULL,
    "isNew" BOOLEAN NOT NULL,
    "isPurchased" BOOLEAN NOT NULL,
    "purchasedAt" TIMESTAMP(3),
    "droppedOffBy" "ReservationDropOffAgent",
    "droppedOffAt" TIMESTAMP(3),
    "hasReturnProcessed" BOOLEAN NOT NULL,
    "returnProcessedAt" TIMESTAMP(3),
    "isResetEarlyByAdmin" BOOLEAN NOT NULL,
    "resetEarlyByAdminAt" TIMESTAMP(3),
    "hasCustomerReturnIntent" BOOLEAN NOT NULL,
    "customerReturnIntentAt" TIMESTAMP(3),
    "isLost" BOOLEAN NOT NULL,
    "lostAt" TIMESTAMP(3),
    "lostInPhase" "ReservationPhase",
    "isDeliveredToCustomer" BOOLEAN NOT NULL,
    "deliveredToCustomerAt" TIMESTAMP(3),
    "isDeliveredToBusiness" BOOLEAN NOT NULL,
    "deliveredToBusinessAt" TIMESTAMP(3),
    "scannedOnInboundAt" TIMESTAMP(3),
    "hasBeenScannedOnInbound" BOOLEAN NOT NULL,
    "scannedOnOutboundAt" TIMESTAMP(3),
    "hasBeenScannedOnOutbound" BOOLEAN NOT NULL,
    "lineItemId" VARCHAR(30),
    "outboundPackageId" VARCHAR(30),
    "inboundPackageId" VARCHAR(30),
    "physicalProduct" VARCHAR(30),
    "reservation" VARCHAR(30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReservationPhysicalProduct_lineItemId_unique" ON "ReservationPhysicalProduct"("lineItemId");

-- AddForeignKey
ALTER TABLE "ReservationPhysicalProduct" ADD FOREIGN KEY ("lineItemId") REFERENCES "OrderLineItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationPhysicalProduct" ADD FOREIGN KEY ("outboundPackageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationPhysicalProduct" ADD FOREIGN KEY ("inboundPackageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationPhysicalProduct" ADD FOREIGN KEY ("physicalProduct") REFERENCES "PhysicalProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationPhysicalProduct" ADD FOREIGN KEY ("id") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
