import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"
import { ProductService } from "./services/product.service"
import { ProductFieldsResolver } from "./fields/product.fields.resolver"
import { ProductQueriesResolver } from "./queries/product.queries.resolver"
import { ProductMutationsResolver } from "./mutations/product.mutations.resolver"
import { ProductVariantFieldsResolver } from "./fields/productVariant.fields.resolver"
import { ProductVariantMutationsResolver } from "./mutations/productVariant.mutations.resolver"
import { ProductUtilsService } from "./services/product.utils.service"
import { UserModule } from "@modules/User/user.module"
import { PhysicalProductService } from "./services/physicalProduct.utils.service"
import { ProductVariantService } from "./services/productVariant.service"
import { AirtableModule } from "@modules/Airtable/airtable.module"
import { ReservationUtilsService } from "./services/reservation.utils.service"
import { ReservationService } from "./services/reservation.service"
import { EmailModule } from "@modules/Email/email.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { BagService } from "./services/bag.service"
import { ProductRequestService } from "./services/productRequest.service"
import { ProductRequestUtilsService } from "./services/productRequest.utils.service"
import { BrandQueriesResolver } from "./queries/brand.queries.resolver"
import { ReservationFeedbackService } from "./services/reservationFeedback.service"
import { ReservationFeedbackQueriesResolver } from "./queries/reservationFeedback.queries.resolver"
import { ReservationFeedbackMutationsResolver } from "./mutations/reservationFeedback.mutations.resolver"

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
