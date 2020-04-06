import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { UtilsService } from "./utils.service"

@Module({
  imports: [PrismaModule],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
