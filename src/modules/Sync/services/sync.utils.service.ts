import { Injectable } from "@nestjs/common"
import cliProgress from "cli-progress"
import { AirtableData, AirtableModelName } from "../../Airtable/airtable.types"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/utils.service"
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

interface LinkStagingRecordInput {
  rootProductionRecord: any
  rootRecordName: AirtableModelName
  targetFieldNameOnRootRecord: string
  allRootStagingRecords: AirtableData
  allTargetProductionRecords: AirtableData
  allTargetStagingRecords: AirtableData
  getRootRecordIdentifer: (rec) => any
  getTargetRecordIdentifer: (rec) => any
}

interface LinkStagingRecordsInput extends LinkStagingRecordInput {
  rootRecordName: AirtableModelName
  allRootProductionRecords: AirtableData
  cliProgressBar?: any
}

@Injectable()
export class SyncUtilsService {
  constructor(
    private readonly airtableService: AirtableService,
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
    private readonly utils: UtilsService
  ) {}

  async createAllStagingRecordsWithoutLinks({
    modelName,
    allProductionRecords,
    sanitizeFunc,
    cliProgressBar,
  }: {
    modelName: AirtableModelName
    allProductionRecords: AirtableData
    sanitizeFunc: (fields: any) => any
    cliProgressBar?: any
  }) {
    for (const rec of allProductionRecords) {
      cliProgressBar?.increment()
      await this.airtableService
        .getStagingBase()(`${modelName}`)
        .create([{ fields: sanitizeFunc(rec.fields) }])
    }
  }

  async createSubBar(
    multibar: any,
    modelName: AirtableModelName,
    numRecords?: number,
    numRecordsModifier?: (num: number) => number
  ) {
    const _numRecords =
      !!numRecordsModifier && !!numRecords
        ? numRecordsModifier(numRecords)
        : numRecords
    return multibar.create(
      _numRecords || (await this.airtableService.getNumRecords(modelName)),
      0,
      {
        modelName: `${modelName}`.padEnd(
          "Homepage Product Rails".length + 1,
          " "
        ),
      }
    )
  }

  async deleteAllStagingRecords(
    modelName: AirtableModelName,
    cliProgressBar?: any
  ) {
    const allRecords = await this.airtableModelNameToGetAllFunc(modelName)(
      this.airtableService.getStagingBase()
    )
    for (const rec of allRecords) {
      cliProgressBar?.increment()
      await this.airtableService
        .getStagingBase()(`${modelName}`)
        .destroy([rec.id])
    }
  }

  deleteFieldsFromObject(obj: object, fieldsToDelete: string[]) {
    const objCopy = { ...obj }
    fieldsToDelete.forEach(a => delete objCopy[a])
    return objCopy
  }

  async linkStagingRecords({
    rootRecordName,
    targetFieldNameOnRootRecord,
    allRootProductionRecords,
    allRootStagingRecords,
    allTargetProductionRecords,
    allTargetStagingRecords,
    getRootRecordIdentifer,
    getTargetRecordIdentifer,
    cliProgressBar,
  }: Omit<LinkStagingRecordsInput, "rootProductionRecord">) {
    for (const rootProductionRecord of allRootProductionRecords) {
      cliProgressBar?.increment()
      if (!rootProductionRecord.fields[`${targetFieldNameOnRootRecord}`]) {
        continue
      }
      await this.linkStagingRecord({
        rootProductionRecord,
        rootRecordName,
        targetFieldNameOnRootRecord,
        allRootStagingRecords,
        allTargetProductionRecords,
        allTargetStagingRecords,
        getRootRecordIdentifer,
        getTargetRecordIdentifer,
      })
    }
  }

  makeAirtableSyncCliProgressBar() {
    return new cliProgress.MultiBar(
      {
        clearOnComplete: false,
        hideCursor: true,
        format: `{modelName} {bar} {percentage}%  ETA: {eta}s  {value}/{total} records`,
      },
      cliProgress.Presets.shades_grey
    )
  }

  async makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
    cliProgressBar,
    numRecords,
    modelName,
  }: {
    cliProgressBar?: any
    numRecords: number
    modelName: AirtableModelName
  }) {
    let multibar
    let _cliProgressBar = cliProgressBar
    if (!_cliProgressBar) {
      multibar = this.makeAirtableSyncCliProgressBar()
      _cliProgressBar = await createSubBar({
        multibar,
        modelName,
        numRecords,
      })
    }
    return [multibar, _cliProgressBar]
  }

  sanitizeAttachments = attachments =>
    attachments?.map(a => this.utils.Identity({ url: a.url }))

  private airtableModelNameToGetAllFunc(modelname: AirtableModelName) {
    const func = {
      Colors: this.airtableService.getAllColors,
      Brands: this.airtableService.getAllBrands,
      Models: this.airtableService.getAllModels,
      Categories: this.airtableService.getAllCategories,
      Locations: this.airtableService.getAllLocations,
      Products: this.airtableService.getAllProducts,
      "Homepage Product Rails": this.airtableService.getAllHomepageProductRails,
      "Product Variants": this.airtableService.getAllProductVariants,
      "Physical Products": this.airtableService.getAllPhysicalProducts,
      Users: this.airtableService.getAllUsers,
      Reservations: this.airtableService.getAllReservations,
      Sizes: this.airtableService.getAllSizes,
      "Top Sizes": this.airtableService.getAllTopSizes,
      "Bottom Sizes": this.airtableService.getAllBottomSizes,
    }[modelname]
    if (!func) {
      throw new Error(`Unrecognized model name: ${modelname}`)
    }
    return func
  }

  private getNumLinks = (modelName: AirtableModelName) => {
    switch (modelName) {
      case "Bottom Sizes":
        return this.syncBottomSizesService.getNumLinksBottomSizes()
      case "Brands":
        return this.syncBrandsService.getNumLinksBrands()
      case "Categories":
        return this.syncCategoriesService.getNumLinksCategories()
      case "Colors":
        return this.syncColorsService.getNumLinksColors()
      case "Homepage Product Rails":
        return this.syncHomepageProductRailsService.getNumLinksHomepageProductRails()
      case "Locations":
        return this.syncLocationsService.getNumLinksLocations()
      case "Models":
        return this.syncModelsService.getNumLinksModels()
      case "Physical Products":
        return this.syncPhysicalProductsService.getNumLinksPhysicalProducts()
      case "Products":
        return this.syncProductsService.getNumLinksProducts()
      case "Product Variants":
        return this.syncProductVariantsService.getNumLinksProductVariants()
      case "Reservations":
        return this.syncReservationsService.getNumLinksReservations()
      case "Sizes":
        return this.syncSizesService.getNumLinksSizes()
      case "Top Sizes":
        return this.syncTopSizesService.getNumLinksTopSizes()
      case "Users":
        return this.syncUsersService.getNumLinksUsers()
    }
    throw new Error("invalid modelName")
  }

  private async getNumProdAndStagingRecords(modelName: AirtableModelName) {
    const prodRecords = await this.airtableModelNameToGetAllFunc(modelName)(
      this.airtableService.getProductionBase()
    )
    const stagingRecords = await this.airtableModelNameToGetAllFunc(modelName)(
      this.airtableService.getStagingBase()
    )
    return [prodRecords.length, stagingRecords.length]
  }

  private getNumReadWritesToSyncModel = async (
    modelName: AirtableModelName
  ) => {
    const [
      numProdRecs,
      numStagingRecs,
    ] = await this.getNumProdAndStagingRecords(modelName)
    return (1 + this.getNumLinks(modelName)) * numProdRecs + numStagingRecs
  }

  private async linkStagingRecord({
    rootProductionRecord,
    rootRecordName,
    targetFieldNameOnRootRecord,
    allRootStagingRecords,
    allTargetProductionRecords,
    allTargetStagingRecords,
    getRootRecordIdentifer,
    getTargetRecordIdentifer,
  }: LinkStagingRecordInput) {
    // Find the staging record that corresponds to the production record
    const correspondingRootStagingRecord = allRootStagingRecords.find(
      rsr =>
        getRootRecordIdentifer(rootProductionRecord) ===
        getRootRecordIdentifer(rsr)
    )
    // Find the linked record(s) id(s) on staging
    const targetProductionRecords = allTargetProductionRecords.filter(r =>
      rootProductionRecord.fields[`${targetFieldNameOnRootRecord}`].includes(
        r.id
      )
    )
    const targetStagingRecords = allTargetStagingRecords.filter(r =>
      targetProductionRecords.reduce(
        (acc, curVal) =>
          acc ||
          getTargetRecordIdentifer(curVal) === getTargetRecordIdentifer(r),
        false
      )
    )
    //   Do the update
    await this.airtableService
      .getStagingBase()(`${rootRecordName}`)
      .update([
        {
          id: correspondingRootStagingRecord.id,
          fields: {
            [targetFieldNameOnRootRecord]: targetStagingRecords.map(r => r.id),
          },
        },
      ])
  }
}
