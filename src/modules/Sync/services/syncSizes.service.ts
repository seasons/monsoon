import { Injectable } from "@nestjs/common"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/utils.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncSizesService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  getNumLinksSizes = () => 0

  getSizeRecordIdentifer = rec => `${rec.fields.Name}${rec.fields.Type}`

  async syncAirtableToAirtable(cliProgressBar?) {
    await this.syncUtils.deleteAllStagingRecords("Sizes", cliProgressBar)
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Sizes",
      allProductionRecords: await this.airtableService.getAllSizes(
        this.airtableService.getProductionBase()
      ),
      sanitizeFunc: fields =>
        this.utils.Identity({
          ...fields,
          "Top Sizes": [],
          "Bottom Sizes": [],
          "Bottom Sizes 2": [],
          "Related Size": [],
          Products: [],
        }),
      cliProgressBar,
    })
  }
}
