import { Injectable } from "@nestjs/common"
import { isEmpty } from "lodash"
import slugify from "slugify"
import { PrismaService } from "../../../prisma/prisma.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/utils.service"
import { SyncUtilsService } from "./sync.utils.service"
import { SyncProductsService } from "./syncProducts.service"

@Injectable()
export class SyncHomepageProductRailsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly syncProductsService: SyncProductsService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  getNumLinksHomepageProductRails = () => 1

  async syncAirtableToAirtable(cliProgressBar?) {
    const allProductionRecs = await this.airtableService.getAllHomepageProductRails(
      this.airtableService.getProductionBase()
    )
    await this.syncUtils.deleteAllStagingRecords(
      "Homepage Product Rails",
      cliProgressBar
    )
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Homepage Product Rails",
      allProductionRecords: allProductionRecs,
      sanitizeFunc: fields => this.utils.Identity({ ...fields, Products: [] }),
      cliProgressBar,
    })

    await this.addProductsLinks(
      allProductionRecs,
      await this.airtableService.getAllHomepageProductRails(
        this.airtableService.getStagingBase()
      ),
      cliProgressBar
    )
  }

  async syncAirtableToPrisma(cliProgressBar?) {
    const records = await this.airtableService.getAllHomepageProductRails()
    const allProducts = await this.airtableService.getAllProducts()

    const [
      multibar,
      _cliProgressBar,
    ] = await this.syncUtils.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
      cliProgressBar,
      numRecords: records.length,
      modelName: "Homepage Product Rails",
    })

    for (const record of records) {
      _cliProgressBar.increment()

      try {
        const { model } = record
        const products = allProducts.findMultipleByIds(model.products)
        const { name } = model

        if (isEmpty(name)) {
          continue
        }

        const slug = slugify(name).toLowerCase()

        const data = {
          products: {
            connect: products.map(product => ({ slug: product.model.slug })),
          },
          slug,
          name,
        }

        await this.prisma.client.upsertHomepageProductRail({
          where: {
            slug,
          },
          create: {
            slug,
            ...data,
          },
          update: data,
        })

        await record.patchUpdate({
          Slug: slug,
        })
      } catch (e) {
        console.error(e)
      }
    }

    multibar?.stop()
  }

  private async addProductsLinks(
    allProductionRecords,
    allStagingRecords,
    cliProgressBar?
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Homepage Product Rails",
      targetFieldNameOnRootRecord: "Products",
      allRootProductionRecords: allProductionRecords,
      allRootStagingRecords: allStagingRecords,
      allTargetProductionRecords: await this.airtableService.getAllProducts(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllProducts(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: rec => rec.fields.Slug,
      getTargetRecordIdentifer: this.syncProductsService
        .getProductRecordIdentifer,
      cliProgressBar,
    })
  }
}
