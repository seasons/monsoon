import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { ProductService } from "./product.service"
import { ProductResolver } from "./product.resolver"
import { AuthService } from "../User/auth.service"
import { CategoryResolver } from "./category.resolver"
import { ProductVariantResolver } from "./productVariant.resolver"

@Module({
  imports: [PrismaModule],
  providers: [
    ProductResolver,
    ProductService,
    AuthService,
    CategoryResolver,
    ProductVariantResolver,
  ],
})
export class ProductModule {}
