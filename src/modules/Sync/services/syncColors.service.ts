import { Injectable } from "@nestjs/common"
import { isEmpty } from "lodash"
import slugify from "slugify"

import { PrismaService } from "../../../prisma/prisma.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncColorsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly syncUtils: SyncUtilsService
  ) {}

  async syncAirtableToAirtable(cliProgressBar?) {
    await this.syncUtils.deleteAllStagingRecords("Colors", cliProgressBar)
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Colors",
      allProductionRecords: await this.airtableService.getAllColors(
        this.airtableService.getProductionBase()
      ),
      sanitizeFunc: fields => fields,
      cliProgressBar,
    })
  }

  async syncAirtableToPrisma(cliProgressBar?) {
    const records = await this.airtableService.getAllColors()

    const [
      multibar,
      _cliProgressBar,
    ] = await this.syncUtils.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
      cliProgressBar,
      numRecords: records.length,
      modelName: "Colors",
    })

    for (const record of records) {
      try {
        _cliProgressBar.increment()

        const { model } = record
        const { name, colorCode, rGB } = model

        if (isEmpty(model) || isEmpty(name)) {
          continue
        }

        const slug = slugify(name).toLowerCase()

        const data = {
          colorCode,
          hexCode: rGB,
          name,
          slug,
        }

        await this.prisma.client.upsertColor({
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
