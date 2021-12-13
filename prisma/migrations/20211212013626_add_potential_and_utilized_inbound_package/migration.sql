-- AlterTable
ALTER TABLE "ReservationPhysicalProduct" ADD COLUMN     "potentialInboundPackageId" VARCHAR(30),
ADD COLUMN     "utilizedInboundPackageId" VARCHAR(30);

-- AddForeignKey
ALTER TABLE "ReservationPhysicalProduct" ADD FOREIGN KEY ("potentialInboundPackageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationPhysicalProduct" ADD FOREIGN KEY ("utilizedInboundPackageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;
