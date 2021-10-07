/*
  Warnings:

  - Made the column `creditBalance` on table `CustomerMembership` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CustomerMembership" ALTER COLUMN "creditBalance" SET NOT NULL,
ALTER COLUMN "creditBalance" SET DEFAULT 0;
