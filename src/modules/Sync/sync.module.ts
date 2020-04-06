import { AirtableModule } from "../Airtable/airtable.module"
import { AirtableSyncService } from "./services/sync.airtable.service"
import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { PrismaSyncService } from "./services/sync.prisma.service"
import { SyncBottomSizesService } from "./services/syncBottomSizes.service"
import { SyncBrandsService } from "./services/syncBrands.service"
import { SyncCategoriesService } from "./services/syncCategories.service"
import { SyncCollectionGroupsService } from "./services/syncCollectionGroups.service"
import { SyncCollectionsService } from "./services/syncCollections.service"
import { SyncColorsService } from "./services/syncColors.service"
import { SyncHomepageProductRailsService } from "./services/syncHomepageProductRails.service"
import { SyncLocationsService } from "./services/syncLocations.service"
import { SyncModelsService } from "./services/syncModels.service"
import { SyncPhysicalProductsService } from "./services/syncPhysicalProducts.service"
import { SyncProductVariantsService } from "./services/syncProductVariants.service"
import { SyncProductsService } from "./services/syncProducts.service"
import { SyncReservationsService } from "./services/syncReservations.service"
import { SyncSizesService } from "./services/syncSizes.service"
import { SyncTopSizesService } from "./services/syncTopSizes.service"
import { SyncUsersService } from "./services/syncUsers.service"
import { SyncUtilsService } from "./services/sync.utils.service"
import { UserModule } from "../User/user.module"
import { UtilsModule } from "../Utils/utils.module"

@Module({
  imports: [AirtableModule, PrismaModule, UserModule, UtilsModule],
  exports: [AirtableSyncService, PrismaSyncService],
  providers: [
    AirtableSyncService,
    PrismaSyncService,
    SyncBottomSizesService,
    SyncBrandsService,
    SyncCategoriesService,
    SyncCollectionGroupsService,
    SyncCollectionsService,
    SyncColorsService,
    SyncHomepageProductRailsService,
    SyncLocationsService,
    SyncModelsService,
    SyncPhysicalProductsService,
    SyncProductsService,
    SyncProductVariantsService,
    SyncReservationsService,
    SyncSizesService,
    SyncTopSizesService,
    SyncUsersService,
    SyncUtilsService,
  ],
})
export class SyncModule {}
