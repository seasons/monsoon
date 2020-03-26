import { Injectable } from "@nestjs/common"
import { AirtableData } from "../../Airtable/airtable.types"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { SyncUtilsService } from "./sync.utils.service"
import { SyncProductsService } from "./syncProducts.service"
import { SyncProductVariantsService } from "./syncProductVariants.service"

@Injectable()
export class SyncPhysicalProductsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly syncProductsService: SyncProductsService,
    private readonly syncProductVariantsService: SyncProductVariantsService,
    private readonly syncUtils: SyncUtilsService
  ) {}

  getNumLinksPhysicalProducts = () => 2

  getPhysicalProductRecordIdentifier = rec => rec.fields.SUID.text

  async syncAirtableToAirtable(cliProgressBar?: any) {
    const allPhysicalProductsProduction = await this.airtableService.getAllPhysicalProducts(
      this.airtableService.getProductionBase()
    )
    await this.syncUtils.deleteAllStagingRecords(
      "Physical Products",
      cliProgressBar
    )
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Physical Products",
      allProductionRecords: allPhysicalProductsProduction,
      sanitizeFunc: fields =>
        this.syncUtils.deleteFieldsFromObject(
          {
            ...fields,
            Product: [],
            Location: [],
            "Product Variant": [],
            Reservations: [],
          },
          [
            "Created At",
            "Updated At",
            "Sequence Number",
            "Item Weight",
            "Barcode Image URL",
            "Images",
            "Barcode",
            "Category",
            "Type",
          ]
        ),
      cliProgressBar,
    })
    const allPhysicalProductsStaging = await this.airtableService.getAllPhysicalProducts(
      this.airtableService.getStagingBase()
    )
    await this.addProductLinks(
      allPhysicalProductsProduction,
      allPhysicalProductsStaging,
      cliProgressBar
    )
    await this.addProductVariantLinks(
      allPhysicalProductsProduction,
      allPhysicalProductsStaging,
      cliProgressBar
    )
  }

  private async addProductLinks(
    allPhysicalProductsProduction: AirtableData,
    allPhysicalProductsStaging: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Physical Products",
      targetFieldNameOnRootRecord: "Product",
      allRootProductionRecords: allPhysicalProductsProduction,
      allRootStagingRecords: allPhysicalProductsStaging,
      allTargetProductionRecords: await this.airtableService.getAllProducts(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllProducts(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getPhysicalProductRecordIdentifier,
      getTargetRecordIdentifer: this.syncProductsService
        .getProductRecordIdentifer,
      cliProgressBar,
    })
  }

  private async addProductVariantLinks(
    allPhysicalProductsProduction: AirtableData,
    allPhysicalProductsStaging: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Physical Products",
      targetFieldNameOnRootRecord: "Product Variant",
      allRootProductionRecords: allPhysicalProductsProduction,
      allRootStagingRecords: allPhysicalProductsStaging,
      allTargetProductionRecords: await this.airtableService.getAllProductVariants(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllProductVariants(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getPhysicalProductRecordIdentifier,
      getTargetRecordIdentifer: this.syncProductVariantsService
        .getProductVariantRecordIdentifier,
      cliProgressBar,
    })
  }
}
