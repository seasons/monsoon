import { Module } from "@nestjs/common"
import { DBService } from "./db.service"
import { PrismaClientService } from "./client.service"
import { PrismaService } from "./prisma.service"

@Module({
  providers: [DBService, PrismaClientService, PrismaService],
  exports: [DBService, PrismaClientService, PrismaService],
})
export class PrismaModule {}
