import { ImageModule } from "@modules/Image/image.module"
import { PrismaModule } from "@modules/Prisma/prisma.module"
import { ProductModule } from "@modules/Product/product.module"
import { UserModule } from "@modules/User/user.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module } from "@nestjs/common"

import { FacebookSyncController } from "./controllers/facebook.sync.controller"
import { PrismaSyncService } from "./services/sync.prisma.service"

@Module({
  controllers: [FacebookSyncController],
  imports: [ImageModule, PrismaModule, ProductModule, UserModule, UtilsModule],
  exports: [PrismaSyncService],
  providers: [PrismaSyncService],
})
export class SyncModule {}
