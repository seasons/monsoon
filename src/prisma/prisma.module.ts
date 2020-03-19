import { Module } from "@nestjs/common"
import { DBService } from "./db.service"
import { PrismaClientService } from "./client.service"

@Module({
  providers: [DBService, PrismaClientService],
  exports: [DBService, PrismaClientService],
})
export class PrismaModule {}
