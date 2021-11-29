-- CreateEnum
CREATE TYPE "PackageDirection" AS ENUM ('Inbound', 'Outbound');

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "direction" "PackageDirection";
