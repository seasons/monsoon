import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { ProductService } from "./services/product.service"
import { ProductFieldsResolver } from "./fields/product.fields.resolver"
import { ProductQueriesResolver } from "./queries/product.queries.resolver"
import { ProductMutationsResolver } from "./mutations/product.mutations.resolver"
import { ProductVariantFieldsResolver } from "./fields/productVariant.fields.resolver"
import { ProductVariantQueriesResolver } from "./queries/productVariant.queries.resolver"
import { ProductVariantMutationsResolver } from "./mutations/productVariant.mutations.resolver"
import { ProductUtilsService } from "./services/product.utils.service"
import { UserModule } from "../User/user.module"
import { PhysicalProductService } from "./services/physicalProduct.utils.service"
import { ProductVariantService } from "./services/productVariant.service"
import { AirtableModule } from "../Airtable/airtable.module"
import { ReservationUtilsService } from "./services/reservation.utils.service"
import { ReservationFeedbackService } from "./services/reservationFeedback.service"
import { ReservationService } from "./services/reservation.service"
import { EmailModule } from "../Email/email.module"
import { ShippingModule } from "../Shipping/shipping.module"
import { BagService } from "./services/bag.service"
import { ProductRequestService } from "./services/productRequest.service"
import { ProductRequestUtilsService } from "./services/productRequest.utils.service"

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
    ReservationFeedbackService,
    ReservationUtilsService,
    ProductFieldsResolver,
    ProductMutationsResolver,
    ProductQueriesResolver,
    ProductVariantFieldsResolver,
    ProductVariantQueriesResolver,
    ProductVariantMutationsResolver,
  ],
})
export class ProductModule { }
