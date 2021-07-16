import { ErrorModule } from "@modules/Error/error.module"
import { PrismaModule } from "@modules/Prisma/prisma.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module } from "@nestjs/common"

import { DripService } from "./services/drip.service"
import { DripSyncService } from "./services/dripSync.service"

@Module({
  imports: [PrismaModule, UtilsModule, ErrorModule],
  providers: [DripService, DripSyncService],
  exports: [DripService, DripSyncService],
})
export class DripModule {}
