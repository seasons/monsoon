import { Injectable } from "@nestjs/common"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/utils.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncModelsService {
  constructor(
    private readonly airtableService: AirtableService,
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
      sanitizeFunc: fields =>
        this.utils.Identity({
          ...fields,
          Products: [],
        }),
      cliProgressBar,
    })
  }
}
