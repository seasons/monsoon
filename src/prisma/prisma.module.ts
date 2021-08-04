import { Module } from "@nestjs/common"

import { PrismaLoader } from "./prisma.loader"
import { PrismaService } from "./prisma.service"

@Module({
  providers: [PrismaService, PrismaLoader],
  exports: [PrismaService, PrismaLoader],
})
export class PrismaModule {}
