import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { ProductService } from "./product.service"
import { ProductResolver } from "./product.resolver"

@Module({
  imports: [PrismaModule],
  providers: [ProductResolver, ProductService],
})
export class ProductModule {}
