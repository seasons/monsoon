/*
  Warnings:

  - Added the required column `user` to the `CreditBalanceUpdateLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CreditBalanceUpdateLog" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user" VARCHAR(30) NOT NULL;

-- AddForeignKey
ALTER TABLE "CreditBalanceUpdateLog" ADD FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
