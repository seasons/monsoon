import { AirtableModelName } from "@modules/Airtable/airtable.types"
import { Injectable } from "@nestjs/common"
import { curry } from "lodash"

import { UtilsService } from "../../Utils/services/utils.service"
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
    private readonly syncUtils: SyncUtilsService,
    private readonly utilsService: UtilsService
  ) {}

  async syncAirtableToAirtable(start: AirtableModelName) {
    // Note that the order matters here in order to properly link between tables.
    console.log(
      `\nNote: If you encounter errors, it's probably a field configuration issue on the destination base\n`
    )

    const _createSubBar = curry(this.syncUtils.createAirtableToAirtableSubBar)(
      this.utilsService.makeCLIProgressBar()
    ).bind(this.syncUtils)

    let modelsInOrder = [
      "Colors",
      "Brands",
      "Models",
      "Categories",
      "Locations",
      "Sizes",
      "Top Sizes",
      "Bottom Sizes",
      "Products",
      "Homepage Product Rails",
      "Product Variants",
      "Physical Products",
      "Users",
      "Reservations",
    ] as AirtableModelName[]
    const startIndex = modelsInOrder.findIndex(a => a === start)
    modelsInOrder = modelsInOrder.slice(startIndex)

    let bars = []
    for (const model of modelsInOrder) {
      bars.push(await _createSubBar(model))
    }

    const syncFuncsInOrder = [
      this.syncColorsService.syncAirtableToAirtable.bind(
        this.syncColorsService
      ),
      this.syncBrandsService.syncAirtableToAirtable.bind(
        this.syncBrandsService
      ),
      this.syncModelsService.syncAirtableToAirtable.bind(
        this.syncModelsService
      ),
      this.syncCategoriesService.syncAirtableToAirtable.bind(
        this.syncCategoriesService
      ),
      this.syncLocationsService.syncAirtableToAirtable.bind(
        this.syncLocationsService
      ),
      this.syncSizesService.syncAirtableToAirtable.bind(this.syncSizesService),
      this.syncTopSizesService.syncAirtableToAirtable.bind(
        this.syncTopSizesService
      ),
      this.syncBottomSizesService.syncAirtableToAirtable.bind(
        this.syncBottomSizesService
      ),
      this.syncProductsService.syncAirtableToAirtable.bind(
        this.syncProductsService
      ),
      this.syncHomepageProductRailsService.syncAirtableToAirtable.bind(
        this.syncHomepageProductRailsService
      ),
      this.syncProductVariantsService.syncAirtableToAirtable.bind(
        this.syncProductVariantsService
      ),
      this.syncPhysicalProductsService.syncAirtableToAirtable.bind(
        this.syncPhysicalProductsService
      ),
      this.syncUsersService.syncAirtableToAirtable.bind(this.syncUsersService),
      this.syncReservationsService.syncAirtableToAirtable.bind(
        this.syncReservationsService
      ),
    ].slice(startIndex)

    try {
      for (const [i, syncFunc] of syncFuncsInOrder.entries()) {
        await syncFunc(bars[i])
      }
    } catch (err) {
      console.log(err)
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
        // await this.syncProductsService.syncAirtableToPrisma()
        return await this.syncProductVariantsService.syncAirtableToPrisma()
      case "physical-products":
        return await this.syncPhysicalProductsService.syncAirtableToPrisma()
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

  private async syncAll() {
    const _createSubBar = curry(
      this.syncUtils.createAirtableToPrismaSubBar,
      2
    )(this.utilsService.makeCLIProgressBar()).bind(this.syncUtils)

    const bars = {
      brands: await _createSubBar("Brands"),
      categories: await _createSubBar("Categories", null, n => n * 2),
      colors: await _createSubBar("Colors"),
      products: await _createSubBar("Products"),
      productVariants: await _createSubBar("Product Variants"),
      physicalProducts: await _createSubBar("Physical Products"),
      collections: await _createSubBar("Collections"),
      collectionGroups: await _createSubBar("Collection Groups"),
      homepageProductRails: await _createSubBar("Homepage Product Rails"),
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
    }
  }
}
