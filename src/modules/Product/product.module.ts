import { EmailModule } from "@modules/Email/email.module"
import { ErrorModule } from "@modules/Error/error.module"
import { ImageModule } from "@modules/Image/image.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { TestModule } from "@modules/Test/test.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module, forwardRef } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { PusherService } from "../PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "../PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "../PushNotification/services/pushNotification.service"
import { ReservationModule } from "../Reservation/reservation.module"
import { SearchModule } from "../Search/search.module"
import { AlgoliaService } from "../Search/services/algolia.service"
import { ShopifyService } from "../Shopify/services/shopify.service"
import { UserModule } from "../User/user.module"
import { AccessorySizeFieldsResolver } from "./fields/accessorySize.fields.resolver"
import { BrandFieldsResolver } from "./fields/brand.fields.resolver"
import { PhysicalProductFieldsResolver } from "./fields/physicalProduct.fields.resolver"
import { ProductFieldsResolver } from "./fields/product.fields.resolver"
import { ProductVariantFieldsResolver } from "./fields/productVariant.fields.resolver"
import { BagMutationsResolver } from "./mutations/bag.mutations.resolver"
import { BrandMutationsResolver } from "./mutations/brand.mutations.resolver"
import { LaunchMutationsResolver } from "./mutations/launch.mutations.resolver"
import { PhysicalProductMutationsResolver } from "./mutations/physicalProduct.mutations.resolver"
import { ProductMutationsResolver } from "./mutations/product.mutations.resolver"
import { ProductVariantMutationsResolver } from "./mutations/productVariant.mutations.resolver"
import { BrandQueriesResolver } from "./queries/brand.queries.resolver"
import { LaunchQueriesResolver } from "./queries/launch.queries.resolver"
import { ProductQueriesResolver } from "./queries/product.queries.resolver"
import { SizeQueriesResolver } from "./queries/size.queries.resolver"
import { BagService } from "./services/bag.service"
import { BrandService } from "./services/brand.service"
import { BrandUtilsService } from "./services/brand.utils.service"
import { LaunchService } from "./services/launch.service"
import { PhysicalProductService } from "./services/physicalProduct.service"
import { PhysicalProductUtilsService } from "./services/physicalProduct.utils.service"
import { ProductService } from "./services/product.service"
import { ProductRequestService } from "./services/productRequest.service"
import { ProductRequestUtilsService } from "./services/productRequest.utils.service"
import { ProductVariantService } from "./services/productVariant.service"

export const ProductModuleDef = {
  imports: [
    EmailModule,
    ErrorModule,
    ImageModule,
    PrismaModule,
    ShippingModule,
    SearchModule,
    UtilsModule,
    forwardRef(() => UserModule),
    forwardRef(() => ReservationModule),
    TestModule,
  ],
  providers: [
    BagService,
    BrandService,
    BrandUtilsService,
    BrandQueriesResolver,
    BagMutationsResolver,
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
    AlgoliaService,
  ],
  exports: [
    ProductVariantService,
    PhysicalProductUtilsService,
    PhysicalProductService,
    BagService,
  ],
}
@Module(ProductModuleDef)
export class ProductModule {}
