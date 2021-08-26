-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "enteredDeliverySystemAt" TIMESTAMP(3),
ADD COLUMN     "lostAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "lostAt" TIMESTAMP(3),
ADD COLUMN     "lostInPhase" "ReservationPhase";
