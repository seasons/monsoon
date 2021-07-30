import { Module } from "@nestjs/common"

import { PrismaLoader } from "./prisma.loader"
import { PrismaService } from "./prisma.service"
import { PrismaUtilsService } from "./prisma.utils"

@Module({
  providers: [PrismaService, PrismaLoader, PrismaUtilsService],
  exports: [PrismaService, PrismaLoader],
})
export class PrismaModule {}
