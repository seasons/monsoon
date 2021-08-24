-- CreateTable
CREATE TABLE "_PackageToReservationReturnPackages" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PackageToReservationReturnPackages_AB_unique" ON "_PackageToReservationReturnPackages"("A", "B");

-- CreateIndex
CREATE INDEX "_PackageToReservationReturnPackages_B_index" ON "_PackageToReservationReturnPackages"("B");

-- AddForeignKey
ALTER TABLE "_PackageToReservationReturnPackages" ADD FOREIGN KEY ("A") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PackageToReservationReturnPackages" ADD FOREIGN KEY ("B") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
