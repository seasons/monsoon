import {
  AirtableData,
  AirtableModelName,
} from "@modules/Airtable/airtable.types"
import { AirtableService } from "@modules/Airtable/services/airtable.service"
import { UtilsService } from "@modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"

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

  async createAirtableToPrismaSubBar(
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

  async createAirtableToAirtableSubBar(multibar, modelName: AirtableModelName) {
    return await multibar.create(
      await this.getNumReadWritesToSyncModel(modelName),
      0,
      {
        modelName: `${modelName}:`.padEnd(
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
      multibar = this.utils.makeCLIProgressBar()
      _cliProgressBar = await this.createAirtableToPrismaSubBar(
        multibar,
        modelName,
        numRecords
      )
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
    return func.bind(this.airtableService)
  }

  private getNumLinks = (modelName: AirtableModelName) => {
    switch (modelName) {
      case "Bottom Sizes":
        return 2
      case "Brands":
        return 0
      case "Categories":
        return 1
      case "Colors":
        return 0
      case "Homepage Product Rails":
        return 1
      case "Locations":
        return 0
      case "Models":
        return 0
      case "Physical Products":
        return 2
      case "Products":
        return 5
      case "Product Variants":
        return 3
      case "Reservations":
        return 2
      case "Sizes":
        return 0
      case "Top Sizes":
        return 1
      case "Users":
        return 1
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
