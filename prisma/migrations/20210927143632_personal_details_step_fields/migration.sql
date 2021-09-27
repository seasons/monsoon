-- AlterTable
ALTER TABLE "CustomerDetail" ADD COLUMN     "ageRange" TEXT,
ADD COLUMN     "signupReasons" TEXT[];

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "customerDetail" VARCHAR(30);

-- AddForeignKey
ALTER TABLE "Product" ADD FOREIGN KEY ("customerDetail") REFERENCES "CustomerDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
