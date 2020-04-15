import { AirtableData } from "../../Airtable/airtable.types"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"
import { SyncProductVariantsService } from "./syncProductVariants.service"
import { SyncProductsService } from "./syncProducts.service"
import { SyncUtilsService } from "./sync.utils.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { isEmpty } from "lodash"

@Injectable()
export class SyncPhysicalProductsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly syncProductsService: SyncProductsService,
    private readonly syncProductVariantsService: SyncProductVariantsService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

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
        this.utils.deleteFieldsFromObject(
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
            "Season",
            "Brand",
            "Retail Price",
            "Architecture",
            "Outer Material",
            "Inner Materials",
            "Display Category",
            "Return Date",
            "Created Date",
            "Type Category",
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

  async syncAirtableToPrisma(cliProgressBar?) {
    const allProductVariants = await this.airtableService.getAllProductVariants()
    const allPhysicalProducts = await this.airtableService.getAllPhysicalProducts()

    const [
      multibar,
      _cliProgressBar,
    ] = await this.syncUtils.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
      cliProgressBar,
      numRecords: allPhysicalProducts.length,
      modelName: "Physical Products",
    })

    for (const record of allPhysicalProducts) {
      _cliProgressBar.increment()

      try {
        const { model } = record

        const productVariant = allProductVariants.findByIds(
          model.productVariant
        )

        if (isEmpty(model)) {
          continue
        }

        const { sUID, inventoryStatus, productStatus } = model

        const data = {
          productVariant: {
            connect: {
              sku: productVariant.model.sKU,
            },
          },
          seasonsUID: sUID.text,
          inventoryStatus: inventoryStatus.replace(" ", ""),
          productStatus,
        }

        await this.prisma.client.upsertPhysicalProduct({
          where: {
            seasonsUID: sUID.text,
          },
          create: data,
          update: data,
        })
      } catch (e) {
        console.error(e)
      }
    }

    multibar?.stop()
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
