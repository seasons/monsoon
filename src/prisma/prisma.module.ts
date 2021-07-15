import { Module } from "@nestjs/common"

import { PrismaService } from "./prisma.service"
import { PrismaLoader } from "./prisma.loader"

@Module({
  providers: [PrismaService, PrismaLoader],
  exports: [PrismaService, PrismaLoader],
})
export class PrismaModule {}
