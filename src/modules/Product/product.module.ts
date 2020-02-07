import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { ProductResolver } from "./product.resolver"

@Module({
  imports: [PrismaModule],
  providers: [ProductResolver],
})
export class ProductModule {}
