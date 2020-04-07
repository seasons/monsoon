import { AirtableService } from "../../Airtable/services/airtable.service"
import { Injectable } from "@nestjs/common"
import { SyncUtilsService } from "./sync.utils.service"
import { UtilsService } from "../../Utils/services/utils.service"

@Injectable()
export class SyncLocationsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  getLocationRecordIdentifier = rec => rec.fields.Slug

  async syncAirtableToAirtable(cliProgressBar?) {
    await this.syncUtils.deleteAllStagingRecords("Locations", cliProgressBar)
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Locations",
      allProductionRecords: await this.airtableService.getAllLocations(
        this.airtableService.getProductionBase()
      ),
      sanitizeFunc: fields =>
        this.utils.deleteFieldsFromObject(
          {
            ...fields,
            "Physical Products": [],
            Reservations: "",
            "Reservations 2": [],
            "Reservations 3": [],
            Users: [],
            "Users 2": [],
          },
          ["Created At", "Updated At", "Record ID"]
        ),
      cliProgressBar,
    })
  }
}
