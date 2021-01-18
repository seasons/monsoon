import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"

import { ShopifyController } from "./controllers/shopify.controller"
import { ShopifyService } from "./services/shopify.service"

@Module({
  controllers: [ShopifyController],
  imports: [PrismaModule],
  providers: [ShopifyService],
  exports: [ShopifyService],
})
export class ShopifyModule {}
