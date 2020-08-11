import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { TestUtilsService } from "./services/test.service"
import { UtilsService } from "./services/utils.service"

@Module({
  imports: [PrismaModule],
  providers: [UtilsService, TestUtilsService],
  exports: [UtilsService, TestUtilsService],
})
export class UtilsModule {}
