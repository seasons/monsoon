import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { AuthService } from "../User/auth.service"
import { ProductService } from "./services/product.service"
import { ProductFieldsResolver } from "./fields/product.fields.resolver"
import { ProductQueriesResolver } from "./queries/product.queries.resolver"
import { ProductMutationsResolver } from "./mutations/product.mutations.resolver"
import { ProductVariantFieldsResolver } from "./fields/productVariant.fields.resolver"
import { ProductVariantQueriesResolver } from "./queries/productVariant.queries.resolver"
import { ProductVariantMutationsResolver } from "./mutations/productVariant.mutations.resolver"

@Module({
  imports: [PrismaModule],
  providers: [
    ProductService,
    AuthService,
    ProductFieldsResolver,
    ProductMutationsResolver,
    ProductQueriesResolver,
    ProductVariantFieldsResolver,
    ProductVariantQueriesResolver,
    ProductVariantMutationsResolver,
  ],
})
export class ProductModule {}
