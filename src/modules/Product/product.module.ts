import { AirtableModule } from "@modules/Airtable/airtable.module"
import { EmailModule } from "@modules/Email/email.module"
import { ImageModule } from "@modules/Image"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { UserModule } from "@modules/User/user.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { ProductFieldsResolver } from "./fields/product.fields.resolver"
import { ProductVariantFieldsResolver } from "./fields/productVariant.fields.resolver"
import { ProductMutationsResolver } from "./mutations/product.mutations.resolver"
import { ProductVariantMutationsResolver } from "./mutations/productVariant.mutations.resolver"
import { BrandQueriesResolver } from "./queries/brand.queries.resolver"
import { ProductQueriesResolver } from "./queries/product.queries.resolver"
import { SizeQueriesResolver } from "./queries/size.queries.resolver"
import { BagService } from "./services/bag.service"
import { PhysicalProductService } from "./services/physicalProduct.utils.service"
import { ProductService } from "./services/product.service"
import { ProductUtilsService } from "./services/product.utils.service"
import { ProductRequestService } from "./services/productRequest.service"
import { ProductRequestUtilsService } from "./services/productRequest.utils.service"
import { ProductVariantService } from "./services/productVariant.service"

@Module({
  imports: [
    AirtableModule,
    EmailModule,
    ImageModule,
    PrismaModule,
    ShippingModule,
    UtilsModule,
    UserModule,
  ],
  providers: [
    BagService,
    BrandQueriesResolver,
    ProductRequestService,
    ProductRequestUtilsService,
    ProductService,
    ProductUtilsService,
    PhysicalProductService,
    ProductVariantService,
    ProductFieldsResolver,
    ProductMutationsResolver,
    ProductQueriesResolver,
    ProductVariantFieldsResolver,
    ProductVariantMutationsResolver,
    SizeQueriesResolver,
  ],
  exports: [ProductUtilsService, ProductVariantService, PhysicalProductService],
})
export class ProductModule {}
