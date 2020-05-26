import * as fs from "fs"

import { AirtableService } from "@modules/Airtable/services/airtable.service"
import { ProductUtilsService } from "@modules/Product/services/product.utils.service"
import { UtilsService } from "@modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"

import { PrismaService } from "../../../prisma/prisma.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncModelsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly productUtils: ProductUtilsService,
    private readonly prisma: PrismaService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  async syncAirtableToAirtable(cliProgressBar?) {
    await this.syncUtils.deleteAllStagingRecords("Models", cliProgressBar)
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Models",
      allProductionRecords: await this.airtableService.getAllModels(
        this.airtableService.getProductionBase()
      ),
      sanitizeFunc: fields => ({
        ...fields,
        Products: [],
      }),
      cliProgressBar,
    })
  }

  async syncAirtableToPrisma(cliProgressBar?) {
    const allBrands = await this.airtableService.getAllBrands()
    const allModels = await this.airtableService.getAllModels()
    const allProducts = await this.airtableService.getAllProducts()

    const [
      multibar,
      _cliProgressBar,
    ] = await this.syncUtils.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
      cliProgressBar,
      numRecords: allModels.length,
      modelName: "Models",
    })

    const logFile = this.utils.openLogFile("syncModels")
    for (const airtableProductModel of allModels) {
      try {
        _cliProgressBar.increment()
        const { model } = airtableProductModel
        const { name, height, products: productIDs } = model
        const productRecords = allProducts.findMultipleByIds(productIDs)

        const productSlugs = productRecords.map(record => {
          const brand = allBrands.findByIds(record.model.brand)
          const { brandCode } = brand.model
          const slug = this.productUtils.getProductSlug(
            brandCode,
            record.model.name,
            record.model.color
          )
          return { slug }
        })

        const productModelData = {
          name,
          height,
          products: { connect: productSlugs },
        }
        await this.prisma.client.upsertProductModel({
          create: productModelData,
          update: productModelData,
          where: { name },
        })
      } catch (e) {
        console.log(`Check ${logFile}`)
        this.syncUtils.logSyncError(logFile, airtableProductModel, e)
      }
    }
    multibar?.stop()
    fs.closeSync(logFile)
  }
}
