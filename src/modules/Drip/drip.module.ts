import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"

import { UtilsModule } from "../Utils/utils.module"
import { DripService } from "./services/drip.service"
import { DripSyncService } from "./services/dripSync.service"

@Module({
  imports: [PrismaModule, UtilsModule],
  providers: [DripService, DripSyncService],
  exports: [DripService, DripSyncService],
})
export class DripModule {}
