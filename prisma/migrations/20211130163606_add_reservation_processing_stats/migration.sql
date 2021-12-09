-- CreateTable
CREATE TABLE "ReservationProcessingStats" (
    "id" VARCHAR(30) NOT NULL,
    "initialNumQueuedItems" INTEGER NOT NULL,
    "initialNumQueuedReservations" INTEGER NOT NULL,
    "currentNumQueuedItems" INTEGER NOT NULL,
    "currentNumQueuedReservations" INTEGER NOT NULL,
    "initialNumDeliveredToBusinessItems" INTEGER NOT NULL,
    "currentNumDeliveredToBusinessItems" INTEGER NOT NULL,
    "day" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);
