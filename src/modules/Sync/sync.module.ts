import { Module } from "@nestjs/common"

import { PrismaModule } from "../../prisma/prisma.module"
import { ImageModule } from "../Image/image.module"
import { ProductModule } from "../Product/product.module"
import { UserModule } from "../User/user.module"
import { UtilsModule } from "../Utils/utils.module"
import { FacebookSyncController } from "./controllers/facebook.sync.controller"
import { ChargebeeSyncService } from "./services/sync.chargebee.service"
import { PrismaSyncService } from "./services/sync.prisma.service"

@Module({
  controllers: [FacebookSyncController],
  imports: [ImageModule, PrismaModule, ProductModule, UserModule, UtilsModule],
  exports: [PrismaSyncService, ChargebeeSyncService],
  providers: [PrismaSyncService, ChargebeeSyncService],
})
export class SyncModule {}
