import * as fs from "fs"

import { Injectable } from "@nestjs/common"
import { isEmpty } from "lodash"

import { PrismaService } from "../../../prisma/prisma.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncPhysicalProductsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  getPhysicalProductRecordIdentifier = rec => rec.fields.SUID.text

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
}
