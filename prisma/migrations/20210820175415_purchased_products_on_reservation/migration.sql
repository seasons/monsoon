-- AlterTable
ALTER TABLE "PhysicalProduct" ADD COLUMN     "purchasedOnReservation" VARCHAR(30);

-- AddForeignKey
ALTER TABLE "PhysicalProduct" ADD FOREIGN KEY ("purchasedOnReservation") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
