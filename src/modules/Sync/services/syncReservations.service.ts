import { Injectable } from "@nestjs/common"
import { AirtableData } from "../../Airtable/airtable.types"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { SyncUtilsService } from "./sync.utils.service"
import { SyncLocationsService } from "./syncLocations.service"
import { SyncPhysicalProductsService } from "./syncPhysicalProducts.service"

@Injectable()
export class SyncReservationsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly syncLocationsService: SyncLocationsService,
    private readonly syncPhysicalProductsService: SyncPhysicalProductsService,
    private readonly syncUtils: SyncUtilsService
  ) {}

  getNumLinksReservations = () => 2

  async syncAirtableToAirtable(cliProgressBar?: any) {
    const allReservationsProduction = await this.airtableService.getAllReservations(
      this.airtableService.getProductionBase()
    )
    await this.syncUtils.deleteAllStagingRecords("Reservations", cliProgressBar)
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Reservations",
      allProductionRecords: allReservationsProduction,
      sanitizeFunc: fields =>
        this.syncUtils.deleteFieldsFromObject(
          {
            ...fields,
            User: [],
            "Current Location": [],
            "Shipping Address": [],
            Items: [],
          },
          [
            "Return Date",
            "Created At",
            "Updated At",
            "Reservation Count",
            "Country",
            "Order Weight Unit",
            "User Location",
            "User Email",
            "Images",
            "Recipient Name",
            "Email",
            "Phone",
            "Street Line 1",
            "Street Line 2",
            "City",
            "State/Province",
            "Zip/Postal Code",
            "Order Weight",
          ]
        ),
      cliProgressBar,
    })

    const allReservationsStaging = await this.airtableService.getAllReservations(
      this.airtableService.getStagingBase()
    )
    await this.addShippingAddressLinks(
      allReservationsProduction,
      allReservationsStaging,
      cliProgressBar
    )
    await this.addItemsLinks(
      allReservationsProduction,
      allReservationsStaging,
      cliProgressBar
    )
  }

  private async addItemsLinks(
    allReservationsProduction: AirtableData,
    allReservationsStaging: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Reservations",
      targetFieldNameOnRootRecord: "Items",
      allRootProductionRecords: allReservationsProduction,
      allRootStagingRecords: allReservationsStaging,
      allTargetProductionRecords: await this.airtableService.getAllPhysicalProducts(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllPhysicalProducts(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getReservationRecordIdentifer,
      getTargetRecordIdentifer: this.syncPhysicalProductsService
        .getPhysicalProductRecordIdentifier,
      cliProgressBar,
    })
  }

  private async addShippingAddressLinks(
    allReservationsProduction: AirtableData,
    allReservationsStaging: AirtableData,
    cliProgressBar: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Reservations",
      targetFieldNameOnRootRecord: "Shipping Address",
      allRootProductionRecords: allReservationsProduction,
      allRootStagingRecords: allReservationsStaging,
      allTargetProductionRecords: await this.airtableService.getAllLocations(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllLocations(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getReservationRecordIdentifer,
      getTargetRecordIdentifer: this.syncLocationsService
        .getLocationRecordIdentifier,
      cliProgressBar,
    })
  }

  private getReservationRecordIdentifer = rec => rec.fields.ID
}
