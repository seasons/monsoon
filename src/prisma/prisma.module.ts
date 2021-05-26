import { Module } from "@nestjs/common"

import { PrismaService } from "./prisma.service"
import { PrismaLoader } from "./prisma.loader"
import { PrismaTwoLoader } from "./prisma2.loader"

@Module({
  providers: [PrismaService, PrismaLoader, PrismaTwoLoader],
  exports: [PrismaService, PrismaLoader, PrismaTwoLoader],
})
export class PrismaModule {}
