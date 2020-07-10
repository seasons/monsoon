import { Injectable } from "@nestjs/common"
import { isEmpty } from "lodash"
import slugify from "slugify"

import { PrismaService } from "../../../prisma/prisma.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncHomepageProductRailsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly syncUtils: SyncUtilsService
  ) {}

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
}
