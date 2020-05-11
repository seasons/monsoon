import * as fs from "fs"

import { PhysicalProductService } from "@modules/Product/index"
import { Injectable } from "@nestjs/common"
import { isEmpty } from "lodash"
import slugify from "slugify"

import { BrandTier, WarehouseLocationCreateInput } from "../../../prisma"
import { PrismaService } from "../../../prisma/prisma.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncBrandsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService,
    private readonly physicalProductsService: PhysicalProductService
  ) {}

  async syncAirtableToAirtable(cliProgressBar?: any) {
    await this.syncUtils.deleteAllStagingRecords("Brands", cliProgressBar)
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Brands",
      allProductionRecords: await this.airtableService.getAllBrands(
        this.airtableService.getProductionBase()
      ),
      sanitizeFunc: fields =>
        this.utils.Identity({
          ...fields,
          Logo: this.syncUtils.sanitizeAttachments(fields.Logo),
          Products: [],
        }),
      cliProgressBar,
    })
  }

  async syncAirtableToPrisma(cliProgressBar?) {
    const records = await this.airtableService.getAllBrands()

    const [
      multibar,
      _cliProgressBar,
    ] = await this.syncUtils.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
      cliProgressBar,
      numRecords: records.length,
      modelName: "Brands",
    })

    const logFile = this.utils.openLogFile("syncBrands")
    for (const record of records) {
      try {
        _cliProgressBar.increment()
        const { model } = record

        const {
          name,
          brandCode,
          description,
          website,
          logo,
          since,
          primary,
          tier,
        } = model

        if (isEmpty(model) || isEmpty(name)) {
          continue
        }

        const slug = slugify(name).toLowerCase()

        const data = {
          slug,
          name,
          tier: (tier || "").replace(" ", "") as BrandTier,
          websiteUrl: website,
          logo,
          description,
          since: since ? `${since}-01-01` : "2019-01-01",
          isPrimaryBrand: primary,
          brandCode,
        }

        await this.prisma.client.upsertBrand({
          where: {
            slug,
          },
          create: {
            slug,
            ...data,
          },
          update: data,
        })

        await this.generateNewSlickRailRecordsIfNeeded(brandCode)

        await record.patchUpdate({
          Slug: slug,
        })
      } catch (e) {
        console.log(`Check ${logFile}`)
        this.syncUtils.logSyncError(logFile, record, e)
      }
    }
    multibar?.stop()
    fs.closeSync(logFile)
  }

  private async generateNewSlickRailRecordsIfNeeded(brandCode) {
    const needed =
      (
        await this.prisma.client.warehouseLocations({
          where: { itemCode: brandCode },
        })
      )?.length === 0
    if (!needed) {
      return
    }

    for (const locationCode of ["A100", "A200"]) {
      const input = {
        type: "Rail",
        itemCode: brandCode,
        locationCode,
        barcode: `SR-${locationCode}-${brandCode}`,
      } as WarehouseLocationCreateInput
      if (
        await this.physicalProductsService.validateWarehouseLocationStructure(
          input
        )
      ) {
        await this.prisma.client.createWarehouseLocation(input)
      }
    }
  }
}
