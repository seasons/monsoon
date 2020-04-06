import { Injectable } from "@nestjs/common"
import { isEmpty } from "lodash"
import slugify from "slugify"
import { PrismaService } from "../../../prisma/prisma.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncCollectionsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}
  async syncAirtableToPrisma(cliProgressBar?) {
    const records = await this.airtableService.getAllCollections()
    const allProducts = await this.airtableService.getAllProducts()

    const [
      multibar,
      _cliProgressBar,
    ] = await this.syncUtils.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
      cliProgressBar,
      numRecords: allProducts.length,
      modelName: "Collections",
    })

    for (const record of records) {
      _cliProgressBar.increment()
      try {
        const { model } = record
        const products = allProducts.findMultipleByIds(model.products)
        const {
          descriptionTop,
          descriptionBottom,
          title,
          subTitle,
          images,
        } = model

        if (isEmpty(images) || isEmpty(title)) {
          continue
        }

        const slug = slugify(title).toLowerCase()

        const data = {
          products: {
            connect: products.map(product => ({ slug: product.model.slug })),
          },
          slug,
          title,
          subTitle,
          descriptionTop,
          descriptionBottom,
          images,
        }

        await this.prisma.client.upsertCollection({
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
