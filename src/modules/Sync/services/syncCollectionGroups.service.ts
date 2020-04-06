import { Injectable } from "@nestjs/common"
import { isEmpty } from "lodash"
import slugify from "slugify"
import { PrismaService } from "../../../prisma/prisma.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncCollectionGroupsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}
  async syncAirtableToPrisma(cliProgressBar?) {
    const records = await this.airtableService.getAllCollectionGroups()
    const allCollections = await this.airtableService.getAllCollections()

    const [
      multibar,
      _cliProgressBar,
    ] = await this.syncUtils.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
      cliProgressBar,
      numRecords: records.length,
      modelName: "Collection Groups",
    })

    for (const record of records) {
      _cliProgressBar.increment()

      try {
        const { model } = record
        const collections = allCollections.findMultipleByIds(model.collections)
        const { title } = model

        if (isEmpty(title)) {
          continue
        }

        const slug = slugify(title).toLowerCase()

        const data = {
          collections: {
            connect: collections.map(collection => {
              return { slug: collection.model.slug }
            }),
          },
          collectionCount: collections.length,
          title,
          slug,
        }

        await this.prisma.client.upsertCollectionGroup({
          where: {
            slug,
          },
          create: data,
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
