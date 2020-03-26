import { Module } from "@nestjs/common"
import { AirtableSyncService } from "./services/sync.airtable.service"
import { PrismaSyncService } from "./services/sync.prisma.service"
import { SyncUtilsService } from "./services/sync.utils.service"

@Module({
  exports: [AirtableSyncService, PrismaSyncService],
  providers: [AirtableSyncService, PrismaSyncService, SyncUtilsService],
})
export class SyncModule {}
