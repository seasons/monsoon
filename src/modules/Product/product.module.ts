import { EmailModule } from "@modules/Email/email.module"
import { ErrorModule } from "@modules/Error/error.module"
import { ImageModule } from "@modules/Image/image.module"
import { PrismaModule } from "@modules/Prisma/prisma.module"
import { BagService } from "@modules/Product/services/bag.service"
import { BrandService } from "@modules/Product/services/brand.service"
import { BrandUtilsService } from "@modules/Product/services/brand.utils.service"
import { LaunchService } from "@modules/Product/services/launch.service"
import { PhysicalProductService } from "@modules/Product/services/physicalProduct.service"
import { PhysicalProductUtilsService } from "@modules/Product/services/physicalProduct.utils.service"
import { ProductService } from "@modules/Product/services/product.service"
import { ProductUtilsService } from "@modules/Product/services/product.utils.service"
import { ProductRequestService } from "@modules/Product/services/productRequest.service"
import { ProductRequestUtilsService } from "@modules/Product/services/productRequest.utils.service"
import { ProductVariantService } from "@modules/Product/services/productVariant.service"
import { PusherService } from "@modules/PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "@modules/PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "@modules/PushNotification/services/pushNotification.service"
import { AlgoliaService } from "@modules/Search/services/algolia.service"
import { SearchService } from "@modules/Search/services/search.service"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { ShopifyService } from "@modules/Shopify/services/shopify.service"
import { UserModule } from "@modules/User/user.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module } from "@nestjs/common"

import { AccessorySizeFieldsResolver } from "./fields/accessorySize.fields.resolver"
import { BrandFieldsResolver } from "./fields/brand.fields.resolver"
import { PhysicalProductFieldsResolver } from "./fields/physicalProduct.fields.resolver"
import { ProductFieldsResolver } from "./fields/product.fields.resolver"
import { ProductVariantFieldsResolver } from "./fields/productVariant.fields.resolver"
import { BrandMutationsResolver } from "./mutations/brand.mutations.resolver"
import { LaunchMutationsResolver } from "./mutations/launch.mutations.resolver"
import { PhysicalProductMutationsResolver } from "./mutations/physicalProduct.mutations.resolver"
import { ProductMutationsResolver } from "./mutations/product.mutations.resolver"
import { ProductVariantMutationsResolver } from "./mutations/productVariant.mutations.resolver"
import { BrandQueriesResolver } from "./queries/brand.queries.resolver"
import { LaunchQueriesResolver } from "./queries/launch.queries.resolver"
import { ProductQueriesResolver } from "./queries/product.queries.resolver"
import { SizeQueriesResolver } from "./queries/size.queries.resolver"

export const ProductModuleDef = {
  imports: [
    EmailModule,
    ErrorModule,
    ImageModule,
    PrismaModule,
    ShippingModule,
    UtilsModule,
    UserModule,
  ],
  providers: [
    BagService,
    BrandService,
    BrandUtilsService,
    BrandQueriesResolver,
    BrandMutationsResolver,
    LaunchService,
    LaunchMutationsResolver,
    LaunchQueriesResolver,
    PusherService,
    PushNotificationService,
    PushNotificationDataProvider,
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
    AccessorySizeFieldsResolver,
    BrandFieldsResolver,
    PhysicalProductMutationsResolver,
    SizeQueriesResolver,
    ShopifyService,
    SearchService,
    AlgoliaService,
  ],
  exports: [
    ProductUtilsService,
    ProductVariantService,
    PhysicalProductUtilsService,
    PhysicalProductService,
    BagService,
  ],
}
@Module(ProductModuleDef)
export class ProductModule {}
