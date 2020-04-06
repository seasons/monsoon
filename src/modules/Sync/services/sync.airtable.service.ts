import { Injectable } from "@nestjs/common"
import { AirtableModelName } from "@modules/Airtable/airtable.types"
import { SyncUtilsService } from "./sync.utils.service"
import { SyncBottomSizesService } from "./syncBottomSizes.service"
import { SyncBrandsService } from "./syncBrands.service"
import { SyncCategoriesService } from "./syncCategories.service"
import { SyncCollectionGroupsService } from "./syncCollectionGroups.service"
import { SyncCollectionsService } from "./syncCollections.service"
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
    private readonly syncCollectionGroupsService: SyncCollectionGroupsService,
    private readonly syncCollectionsService: SyncCollectionsService,
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
    const multibar = this.syncUtils.makeAirtableSyncCliProgressBar()
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

  async syncAirtableToPrisma(table) {
    switch (table) {
      case "all":
        return await this.syncAll()
      case "brands":
        return await this.syncBrandsService.syncAirtableToPrisma()
      case "categories":
        return await this.syncCategoriesService.syncAirtableToPrisma()
      case "products":
        return await this.syncProductsService.syncAirtableToPrisma()
      case "product-variants":
        await this.syncProductsService.syncAirtableToPrisma()
        return await this.syncProductVariantsService.syncAirtableToPrisma()
      case "collections":
        return await this.syncCollectionsService.syncAirtableToPrisma()
      case "collection-groups":
        return await this.syncCollectionGroupsService.syncAirtableToPrisma()
      case "homepage-product-rails":
        return await this.syncHomepageProductRailsService.syncAirtableToPrisma()
      default:
        throw new Error("invalid table name")
    }
  }

  async createSubBar(multibar, modelName: AirtableModelName) {
    return await this.syncUtils.createSyncAirtableSubBar(multibar, modelName)
  }

  private async syncAll() {
    const multibar = this.syncUtils.makeAirtableSyncCliProgressBar()

    const bars = {
      brands: await this.syncUtils.createSubBar(multibar, "Brands"),
      categories: await this.syncUtils.createSubBar(
        multibar,
        "Categories",
        null,
        n => n * 2
      ),
      colors: await this.syncUtils.createSubBar(multibar, "Colors"),
      products: await this.syncUtils.createSubBar(multibar, "Products"),
      productVariants: await this.syncUtils.createSubBar(
        multibar,
        "Product Variants"
      ),
      physicalProducts: await this.syncUtils.createSubBar(
        multibar,
        "Physical Products"
      ),
      collections: await this.syncUtils.createSubBar(multibar, "Collections"),
      collectionGroups: await this.syncUtils.createSubBar(
        multibar,
        "Collection Groups"
      ),
      homepageProductRails: await this.syncUtils.createSubBar(
        multibar,
        "Homepage Product Rails"
      ),
    }

    // ignore locations because of complications with slugs. plus, we dont really use them yet.
    try {
      await this.syncBrandsService.syncAirtableToPrisma(bars.brands)
      await this.syncCategoriesService.syncAirtableToPrisma(bars.categories)
      await this.syncColorsService.syncAirtableToPrisma(bars.colors)
      await this.syncProductsService.syncAirtableToPrisma(bars.products)
      await this.syncProductVariantsService.syncAirtableToPrisma(
        bars.productVariants
      )
      await this.syncPhysicalProductsService.syncAirtableToPrisma(
        bars.physicalProducts
      )
      await this.syncCollectionsService.syncAirtableToPrisma(bars.collections)
      await this.syncCollectionGroupsService.syncAirtableToPrisma(
        bars.collectionGroups
      )
      await this.syncHomepageProductRailsService.syncAirtableToPrisma(
        bars.homepageProductRails
      )
    } catch (e) {
      console.log(e)
    } finally {
      multibar.stop()
    }
  }
}
