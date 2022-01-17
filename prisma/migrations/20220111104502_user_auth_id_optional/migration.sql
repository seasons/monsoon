-- AlterEnum
ALTER TYPE "CustomerStatus" ADD VALUE 'Guest';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "auth0Id" DROP NOT NULL,
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;
