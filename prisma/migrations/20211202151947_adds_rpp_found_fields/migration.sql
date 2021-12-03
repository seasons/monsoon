-- AlterTable
ALTER TABLE "ReservationPhysicalProduct" ADD COLUMN     "foundAt" TIMESTAMP(3),
ADD COLUMN     "foundInPhase" "ReservationPhase",
ADD COLUMN     "hasBeenFound" BOOLEAN NOT NULL DEFAULT false;
