import { Module } from "@nestjs/common"

import { PrismaModule } from "../../prisma/prisma.module"
import { AirtableModule } from "../Airtable/airtable.module"
import { ImageModule } from "../Image/image.module"
import { ProductModule } from "../Product/product.module"
import { UserModule } from "../User/user.module"
import { UtilsModule } from "../Utils/utils.module"
import { AirtableSyncService } from "./services/sync.airtable.service"
import { PrismaSyncService } from "./services/sync.prisma.service"
import { SyncUtilsService } from "./services/sync.utils.service"
import { SyncBrandsService } from "./services/syncBrands.service"
import { SyncCategoriesService } from "./services/syncCategories.service"
import { SyncCollectionGroupsService } from "./services/syncCollectionGroups.service"
import { SyncCollectionsService } from "./services/syncCollections.service"
import { SyncColorsService } from "./services/syncColors.service"
import { SyncHomepageProductRailsService } from "./services/syncHomepageProductRails.service"
import { SyncModelsService } from "./services/syncModels.service"
import { SyncPhysicalProductsService } from "./services/syncPhysicalProducts.service"
import { SyncProductsService } from "./services/syncProducts.service"
import { SyncProductVariantsService } from "./services/syncProductVariants.service"

@Module({
  imports: [
    AirtableModule,
    ImageModule,
    PrismaModule,
    ProductModule,
    UserModule,
    UtilsModule,
  ],
  exports: [AirtableSyncService, PrismaSyncService],
  providers: [
    AirtableSyncService,
    PrismaSyncService,
    SyncBrandsService,
    SyncCategoriesService,
    SyncCollectionGroupsService,
    SyncCollectionsService,
    SyncColorsService,
    SyncHomepageProductRailsService,
    SyncModelsService,
    SyncPhysicalProductsService,
    SyncProductsService,
    SyncProductVariantsService,
    SyncUtilsService,
  ],
})
export class SyncModule {}
