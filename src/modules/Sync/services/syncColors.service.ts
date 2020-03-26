import { Injectable } from "@nestjs/common"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncColorsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly syncUtils: SyncUtilsService
  ) {}

  getNumLinksColors = () => 0

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
}
