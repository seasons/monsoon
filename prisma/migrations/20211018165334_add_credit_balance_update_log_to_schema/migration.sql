-- CreateTable
CREATE TABLE "CreditBalanceUpdateLog" (
    "id" VARCHAR(30) NOT NULL,
    "membership" VARCHAR(30) NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CreditBalanceUpdateLog" ADD FOREIGN KEY ("membership") REFERENCES "CustomerMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
