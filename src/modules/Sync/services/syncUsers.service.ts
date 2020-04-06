import { Injectable } from "@nestjs/common"

import { AirtableData } from "../../Airtable/airtable.types"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/utils.service"
import { SyncUtilsService } from "./sync.utils.service"
import { SyncLocationsService } from "./syncLocations.service"

@Injectable()
export class SyncUsersService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly syncLocationsService: SyncLocationsService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  async syncAirtableToAirtable(cliProgressBar?: any) {
    const allUsersProduction = await this.airtableService.getAllUsers(
      this.airtableService.getProductionBase()
    )
    await this.syncUtils.deleteAllStagingRecords("Users", cliProgressBar)
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Users",
      allProductionRecords: allUsersProduction,
      sanitizeFunc: fields =>
        this.utils.deleteFieldsFromObject(
          {
            ...fields,
            "Shipping Address": [],
            Location: [],
            "Billing Info": [],
            Reservations: [],
          },
          ["Joined", "Full Name"]
        ),
      cliProgressBar,
    })
    const allUsersStaging = await this.airtableService.getAllUsers(
      this.airtableService.getStagingBase()
    )
    await this.addShippingAddressLinks(
      allUsersProduction,
      allUsersStaging,
      cliProgressBar
    )
  }

  private async addShippingAddressLinks(
    allUsersProduction: AirtableData,
    allUsersStaging: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Users",
      targetFieldNameOnRootRecord: "Shipping Address",
      allRootProductionRecords: allUsersProduction,
      allRootStagingRecords: allUsersStaging,
      allTargetProductionRecords: await this.airtableService.getAllLocations(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllLocations(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: rec => rec.fields.Email,
      getTargetRecordIdentifer: this.syncLocationsService
        .getLocationRecordIdentifier,
      cliProgressBar,
    })
  }
}
