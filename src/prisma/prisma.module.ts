import { Module } from "@nestjs/common"

import { PrismaLoader } from "./prisma.loader"
import { PrismaService } from "./prisma.service"
import { MockPrismaUtilsService, PrismaUtilsService } from "./prisma.utils"

const prismaUtilsProvider = {
  provide: PrismaUtilsService,
  useClass:
    process.env.CLI === "true" ? MockPrismaUtilsService : PrismaUtilsService,
}
@Module({
  providers: [PrismaService, PrismaLoader, prismaUtilsProvider],
  exports: [PrismaService, PrismaLoader],
})
export class PrismaModule {}
