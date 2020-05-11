import * as fs from "fs"

import { PhysicalProductUpdateInput } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { isEmpty } from "lodash"

import { PrismaService } from "../../../prisma/prisma.service"
import { AirtableData } from "../../Airtable/airtable.types"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { SyncUtilsService } from "./sync.utils.service"
import { SyncProductsService } from "./syncProducts.service"
import { SyncProductVariantsService } from "./syncProductVariants.service"

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

    const logFile = this.utils.openLogFile("syncPhysicalProducts")
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

        const {
          suid,
          inventoryStatus,
          productStatus,
          warehouseLocationId,
        } = model

        const data = {
          productVariant: {
            connect: {
              sku: productVariant.model.sku,
            },
          },
          seasonsUID: suid.text,
          inventoryStatus: inventoryStatus.replace(" ", ""),
          productStatus,
          barcode: model.barcode,
          sequenceNumber: model.sequenceNumber,
          warehouseLocation: !!warehouseLocationId
            ? { connect: { barcode: warehouseLocationId } }
            : null,
        }

        await this.prisma.client.upsertPhysicalProduct({
          where: {
            seasonsUID: suid.text,
          },
          create: data,
          update: data,
        })
      } catch (e) {
        this.syncUtils.logSyncError(logFile, record, e)
      }
    }

    multibar?.stop()
    fs.closeSync(logFile)
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
