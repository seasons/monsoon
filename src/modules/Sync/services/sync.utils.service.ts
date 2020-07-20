import { AirtableModelName } from "@modules/Airtable/airtable.types"
import { AirtableService } from "@modules/Airtable/services/airtable.service"
import { UtilsService } from "@modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"

@Injectable()
export class SyncUtilsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly utils: UtilsService
  ) {}

  logSyncError(logFile: number, record, error: Error) {
    this.utils.writeLines(logFile, [
      "THREW ERROR",
      "Record:",
      record,
      "Error:",
      error,
    ])
  }

  async createAirtableToPrismaSubBar(
    multibar: any,
    modelName: AirtableModelName,
    numRecords?: number,
    numRecordsModifier?: (num: number) => number
  ) {
    const _numRecords =
      !!numRecordsModifier && !!numRecords
        ? numRecordsModifier(numRecords)
        : numRecords
    return multibar.create(
      _numRecords || (await this.airtableService.getNumRecords(modelName)),
      0,
      {
        modelName: `${modelName}`.padEnd(
          "Homepage Product Rails".length + 1,
          " "
        ),
      }
    )
  }

  async makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
    cliProgressBar,
    numRecords,
    modelName,
  }: {
    cliProgressBar?: any
    numRecords: number
    modelName: AirtableModelName
  }) {
    let multibar
    let _cliProgressBar = cliProgressBar
    if (!_cliProgressBar) {
      multibar = this.utils.makeCLIProgressBar()
      _cliProgressBar = await this.createAirtableToPrismaSubBar(
        multibar,
        modelName,
        numRecords
      )
    }
    return [multibar, _cliProgressBar]
  }
}
