import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"

import { DripService } from "./services/drip.service"
import { DripSyncService } from "./services/dripSync.service"

@Module({
  imports: [PrismaModule],
  providers: [DripService, DripSyncService],
})
export class DripModule {}
