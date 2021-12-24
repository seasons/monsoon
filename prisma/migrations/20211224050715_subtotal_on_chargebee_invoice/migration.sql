/*
  Warnings:

  - You are about to drop the column `total` on the `ChargebeeInvoice` table. All the data in the column will be lost.
  - Added the required column `subtotal` to the `ChargebeeInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChargebeeInvoice" DROP COLUMN "total",
ADD COLUMN     "subtotal" INTEGER NOT NULL;
