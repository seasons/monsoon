import { Module } from "@nestjs/common"
import { UtilsService } from "./utils.service"
import { PrismaModule } from "../../prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
