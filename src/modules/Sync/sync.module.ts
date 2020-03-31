import { Module } from "@nestjs/common"
import { PrismaSyncService } from "./services/sync.prisma.service"
import { UserModule } from "../User/user.module"
import { PrismaModule } from "../../prisma/prisma.module"

@Module({
  imports: [PrismaModule, UserModule],
  exports: [PrismaSyncService],
  providers: [PrismaSyncService],
})
export class SyncModule {}
