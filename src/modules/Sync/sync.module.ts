import { Module } from "@nestjs/common"
import { PrismaSyncService } from "./services/prisma.service"

@Module({
  exports: [PrismaSyncService],
  providers: [PrismaSyncService],
})
export class SyncModule {}
