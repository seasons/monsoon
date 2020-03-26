import { Injectable } from "@nestjs/common"
import { AirtableData } from "../../Airtable/airtable.types"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { SyncUtilsService } from "./sync.utils.service"
import { SyncBottomSizesService } from "./syncBottomSizes.service"
import { SyncProductsService } from "./syncProducts.service"
import { SyncTopSizesService } from "./syncTopSizes.service"

@Injectable()
export class SyncProductVariantsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly syncBottomSizesService: SyncBottomSizesService,
    private readonly syncProductsService: SyncProductsService,
    private readonly syncTopSizesService: SyncTopSizesService,
    private readonly syncUtils: SyncUtilsService
  ) {}

  getNumLinksProductVariants = () => 3

  getProductVariantRecordIdentifier = rec => rec.fields.SKU

  async syncAirtableToAirtable(cliProgressBar?) {
    const allProductVariantsProduction = await this.airtableService.getAllProductVariants(
      this.airtableService.getProductionBase()
    )
    await this.syncUtils.deleteAllStagingRecords(
      "Product Variants",
      cliProgressBar
    )
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Product Variants",
      allProductionRecords: allProductVariantsProduction,
      sanitizeFunc: fields =>
        this.syncUtils.deleteFieldsFromObject(
          {
            ...fields,
            Product: [],
            "Physical Products": [],
            Orders: [],
            "Top Size": [],
            "Bottom Size": [],
          },
          ["Variant Number", "Created At", "Images", "Brand", "Color", "Type"]
        ),
      cliProgressBar,
    })
    const allProductVariantsStaging = await this.airtableService.getAllProductVariants(
      this.airtableService.getStagingBase()
    )
    await this.addProductLinks(
      allProductVariantsProduction,
      allProductVariantsStaging,
      cliProgressBar
    )
    await this.addTopSizeLinks(
      allProductVariantsProduction,
      allProductVariantsStaging,
      cliProgressBar
    )
    await this.addBottomSizeLinks(
      allProductVariantsProduction,
      allProductVariantsStaging,
      cliProgressBar
    )
  }

  private async addBottomSizeLinks(
    allProductionProductVariants: AirtableData,
    allStagingProductVariants: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Product Variants",
      targetFieldNameOnRootRecord: "Bottom Size",
      allRootProductionRecords: allProductionProductVariants,
      allRootStagingRecords: allStagingProductVariants,
      allTargetProductionRecords: await this.airtableService.getAllBottomSizes(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllBottomSizes(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getProductVariantRecordIdentifier,
      getTargetRecordIdentifer: this.syncBottomSizesService
        .getBottomSizeRecordIdentifer,
      cliProgressBar,
    })
  }

  private async addProductLinks(
    allProductionProductVariants: AirtableData,
    allStagingProductVariants: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Product Variants",
      targetFieldNameOnRootRecord: "Product",
      allRootProductionRecords: allProductionProductVariants,
      allRootStagingRecords: allStagingProductVariants,
      allTargetProductionRecords: await this.airtableService.getAllProducts(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllProducts(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getProductVariantRecordIdentifier,
      getTargetRecordIdentifer: this.syncProductsService
        .getProductRecordIdentifer,
      cliProgressBar,
    })
  }

  private async addTopSizeLinks(
    allProductionProductVariants: AirtableData,
    allStagingProductVariants: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Product Variants",
      targetFieldNameOnRootRecord: "Top Size",
      allRootProductionRecords: allProductionProductVariants,
      allRootStagingRecords: allStagingProductVariants,
      allTargetProductionRecords: await this.airtableService.getAllTopSizes(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllTopSizes(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getProductVariantRecordIdentifier,
      getTargetRecordIdentifer: this.syncTopSizesService
        .getTopSizeRecordIdentifier,
      cliProgressBar,
    })
  }
}
