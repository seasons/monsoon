-- AlterTable
ALTER TABLE "CustomerDetail" ADD COLUMN     "ageRange" TEXT,
ADD COLUMN     "signupReasons" TEXT[];

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "customerDetail" VARCHAR(30);

-- CreateTable
CREATE TABLE "_CustomerDetailToProduct" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CustomerDetailToProduct_AB_unique" ON "_CustomerDetailToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_CustomerDetailToProduct_B_index" ON "_CustomerDetailToProduct"("B");

-- AddForeignKey
ALTER TABLE "Product" ADD FOREIGN KEY ("customerDetail") REFERENCES "CustomerDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerDetailToProduct" ADD FOREIGN KEY ("A") REFERENCES "CustomerDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerDetailToProduct" ADD FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
