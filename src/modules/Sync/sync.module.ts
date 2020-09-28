import { Module } from "@nestjs/common"

import { PrismaModule } from "../../prisma/prisma.module"
import { ImageModule } from "../Image/image.module"
import { ProductModule } from "../Product/product.module"
import { UserModule } from "../User/user.module"
import { UtilsModule } from "../Utils/utils.module"
import { PrismaSyncService } from "./services/sync.prisma.service"

@Module({
  imports: [ImageModule, PrismaModule, ProductModule, UserModule, UtilsModule],
  exports: [PrismaSyncService],
  providers: [PrismaSyncService],
})
export class SyncModule {}
