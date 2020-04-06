import { AirtableModule } from "@modules/Airtable/airtable.module"
import { EmailModule } from "@modules/Email/email.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { UserModule } from "@modules/User/user.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { ProductFieldsResolver } from "./fields/product.fields.resolver"
import { ProductVariantFieldsResolver } from "./fields/productVariant.fields.resolver"
import { ProductMutationsResolver } from "./mutations/product.mutations.resolver"
import { ProductVariantMutationsResolver } from "./mutations/productVariant.mutations.resolver"
import { ReservationFeedbackMutationsResolver } from "./mutations/reservationFeedback.mutations.resolver"
import { BrandQueriesResolver } from "./queries/brand.queries.resolver"
import { ProductQueriesResolver } from "./queries/product.queries.resolver"
import { ReservationFeedbackQueriesResolver } from "./queries/reservationFeedback.queries.resolver"
import { BagService } from "./services/bag.service"
import { PhysicalProductService } from "./services/physicalProduct.utils.service"
import { ProductService } from "./services/product.service"
import { ProductUtilsService } from "./services/product.utils.service"
import { ProductRequestService } from "./services/productRequest.service"
import { ProductRequestUtilsService } from "./services/productRequest.utils.service"
import { ProductVariantService } from "./services/productVariant.service"
import { ReservationService } from "./services/reservation.service"
import { ReservationUtilsService } from "./services/reservation.utils.service"
import { ReservationFeedbackService } from "./services/reservationFeedback.service"

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AirtableModule,
    EmailModule,
    ShippingModule,
  ],
  providers: [
    BagService,
    ProductRequestService,
    ProductRequestUtilsService,
    ProductService,
    ProductUtilsService,
    PhysicalProductService,
    ProductVariantService,
    ReservationService,
    ReservationUtilsService,
    ReservationFeedbackService,
    ProductFieldsResolver,
    ProductMutationsResolver,
    ProductQueriesResolver,
    ProductVariantFieldsResolver,
    ProductVariantMutationsResolver,
    BrandQueriesResolver,
    ReservationFeedbackQueriesResolver,
    ReservationFeedbackMutationsResolver,
  ],
})
export class ProductModule {}
