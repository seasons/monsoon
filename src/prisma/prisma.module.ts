import { Module } from "@nestjs/common"
import { DBService } from "./DB.service"

@Module({
  providers: [DBService],
  exports: [DBService],
})
export class PrismaModule {}
