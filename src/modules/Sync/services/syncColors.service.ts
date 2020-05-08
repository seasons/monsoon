import * as fs from "fs"

import { UtilsService } from "@app/modules/Utils"
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
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
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

    const logFile = this.utils.openLogFile("syncColors")
    for (const record of records) {
      try {
        _cliProgressBar.increment()

        const { model } = record
        const { name, colorCode, rgb } = model

        if (isEmpty(model) || isEmpty(name)) {
          continue
        }

        const slug = slugify(name).toLowerCase()

        const data = {
          colorCode,
          hexCode: rgb,
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
        console.log(`Check ${logFile}`)
        this.syncUtils.logSyncError(logFile, record, e)
      }
    }
    multibar?.stop()
    fs.closeSync(logFile)
  }
}
