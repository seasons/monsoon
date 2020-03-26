import { Injectable } from "@nestjs/common"
import cliProgress from "cli-progress"
import { SyncUtilsService } from "./sync.utils.service"
import { SyncBottomSizesService } from "./syncBottomSizes.service"
import { SyncBrandsService } from "./syncBrands.service"
import { SyncCategoriesService } from "./syncCategories.service"
import { SyncColorsService } from "./syncColors.service"
import { SyncHomepageProductRailsService } from "./syncHomepageProductRails.service"
import { SyncLocationsService } from "./syncLocations.service"
import { SyncModelsService } from "./syncModels.service"
import { SyncPhysicalProductsService } from "./syncPhysicalProducts.service"
import { SyncProductsService } from "./syncProducts.service"
import { SyncProductVariantsService } from "./syncProductVariants.service"
import { SyncReservationsService } from "./syncReservations.service"
import { SyncSizesService } from "./syncSizes.service"
import { SyncTopSizesService } from "./syncTopSizes.service"
import { SyncUsersService } from "./syncUsers.service"

@Injectable()
export class AirtableSyncService {
  constructor(
    private readonly syncBottomSizesService: SyncBottomSizesService,
    private readonly syncBrandsService: SyncBrandsService,
    private readonly syncCategoriesService: SyncCategoriesService,
    private readonly syncColorsService: SyncColorsService,
    private readonly syncHomepageProductRailsService: SyncHomepageProductRailsService,
    private readonly syncLocationsService: SyncLocationsService,
    private readonly syncModelsService: SyncModelsService,
    private readonly syncPhysicalProductsService: SyncPhysicalProductsService,
    private readonly syncProductsService: SyncProductsService,
    private readonly syncProductVariantsService: SyncProductVariantsService,
    private readonly syncReservationsService: SyncReservationsService,
    private readonly syncSizesService: SyncSizesService,
    private readonly syncTopSizesService: SyncTopSizesService,
    private readonly syncUsersService: SyncUsersService,
    private readonly syncUtils: SyncUtilsService
  ) {}

  async syncAirtableToAirtable() {
    // Note that the order matters here in order to properly link between tables.
    console.log(
      `\nNote: If you encounter errors, it's probably a field configuration issue on the destination base\n`
    )
    const multibar = new cliProgress.MultiBar(
      {
        clearOnComplete: false,
        hideCursor: true,
        format: `{modelName} {bar} {percentage}%  ETA: {eta}s  {value}/{total} ops`,
      },
      cliProgress.Presets.shades_grey
    )
    const bars = {
      colors: await this.syncUtils.createSubBar(multibar, "Colors"),
      brands: await this.syncUtils.createSubBar(multibar, "Brands"),
      models: await this.syncUtils.createSubBar(multibar, "Models"),
      categories: await this.syncUtils.createSubBar(multibar, "Categories"),
      locations: await this.syncUtils.createSubBar(multibar, "Locations"),
      sizes: await this.syncUtils.createSubBar(multibar, "Sizes"),
      topSizes: await this.syncUtils.createSubBar(multibar, "Top Sizes"),
      bottomSizes: await this.syncUtils.createSubBar(multibar, "Bottom Sizes"),
      products: await this.syncUtils.createSubBar(multibar, "Products"),
      homepageProductRails: await this.syncUtils.createSubBar(
        multibar,
        "Homepage Product Rails"
      ),
      productVariants: await this.syncUtils.createSubBar(
        multibar,
        "Product Variants"
      ),
      physicalProducts: await this.syncUtils.createSubBar(
        multibar,
        "Physical Products"
      ),
      users: await this.syncUtils.createSubBar(multibar, "Users"),
      reservations: await this.syncUtils.createSubBar(multibar, "Reservations"),
    }
    try {
      await this.syncBottomSizesService.syncAirtableToAirtable(bars.bottomSizes)
      await this.syncBrandsService.syncAirtableToAirtable(bars.brands)
      await this.syncCategoriesService.syncAirtableToAirtable(bars.categories)
      await this.syncColorsService.syncAirtableToAirtable(bars.colors)
      await this.syncHomepageProductRailsService.syncAirtableToAirtable(
        bars.homepageProductRails
      )
      await this.syncLocationsService.syncAirtableToAirtable(bars.locations)
      await this.syncModelsService.syncAirtableToAirtable(bars.models)
      await this.syncPhysicalProductsService.syncAirtableToAirtable(
        bars.physicalProducts
      )
      await this.syncProductsService.syncAirtableToAirtable(bars.products)
      await this.syncProductVariantsService.syncAirtableToAirtable(
        bars.productVariants
      )
      await this.syncReservationsService.syncAirtableToAirtable(
        bars.reservations
      )
      await this.syncSizesService.syncAirtableToAirtable(bars.sizes)
      await this.syncTopSizesService.syncAirtableToAirtable(bars.topSizes)
      await this.syncUsersService.syncAirtableToAirtable(bars.users)
    } catch (err) {
      console.log(err)
    } finally {
      multibar.stop()
    }
  }
}
