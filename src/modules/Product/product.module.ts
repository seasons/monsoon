import { EmailModule } from "@modules/Email/email.module"
import { ImageModule } from "@modules/Image/image.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { UserModule } from "@modules/User/user.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { BrandFieldsResolver } from "./fields/brand.fields.resolver"
import { PhysicalProductFieldsResolver } from "./fields/physicalProduct.fields.resolver"
import { ProductFieldsResolver } from "./fields/product.fields.resolver"
import { ProductVariantFieldsResolver } from "./fields/productVariant.fields.resolver"
import { BrandMutationsResolver } from "./mutations/brand.mutations.resolver"
import { PhysicalProductMutationsResolver } from "./mutations/physicalProduct.mutations.resolver"
import { ProductMutationsResolver } from "./mutations/product.mutations.resolver"
import { ProductVariantMutationsResolver } from "./mutations/productVariant.mutations.resolver"
import { BrandQueriesResolver } from "./queries/brand.queries.resolver"
import { ProductQueriesResolver } from "./queries/product.queries.resolver"
import { SizeQueriesResolver } from "./queries/size.queries.resolver"
import { BagService } from "./services/bag.service"
import { BrandService } from "./services/brand.service"
import { PhysicalProductService } from "./services/physicalProduct.service"
import { PhysicalProductUtilsService } from "./services/physicalProduct.utils.service"
import { ProductService } from "./services/product.service"
import { ProductUtilsService } from "./services/product.utils.service"
import { ProductRequestService } from "./services/productRequest.service"
import { ProductRequestUtilsService } from "./services/productRequest.utils.service"
import { ProductVariantService } from "./services/productVariant.service"

export const ProductModuleDef = {
  imports: [
    EmailModule,
    ImageModule,
    PrismaModule,
    ShippingModule,
    UtilsModule,
    UserModule,
  ],
  providers: [
    BagService,
    BrandService,
    BrandQueriesResolver,
    BrandMutationsResolver,
    ProductRequestService,
    ProductRequestUtilsService,
    ProductService,
    ProductUtilsService,
    PhysicalProductUtilsService,
    PhysicalProductService,
    ProductVariantService,
    ProductFieldsResolver,
    ProductMutationsResolver,
    ProductQueriesResolver,
    ProductVariantFieldsResolver,
    ProductVariantMutationsResolver,
    PhysicalProductFieldsResolver,
    BrandFieldsResolver,
    PhysicalProductMutationsResolver,
    SizeQueriesResolver,
  ],
  exports: [
    ProductUtilsService,
    ProductVariantService,
    PhysicalProductUtilsService,
    PhysicalProductService,
  ],
}
@Module(ProductModuleDef)
export class ProductModule {}
