import { Injectable } from "@nestjs/common"
import {
  InventoryStatus,
  PhysicalProduct,
  ReservationCreateInput,
  ReservationStatus,
  User,
} from "@prisma/index"
import { compact, fill, head, zip } from "lodash"

import {
  AirtableData,
  AirtableInventoryStatus,
  AirtableModelName,
  AirtablePhysicalProductFields,
  AirtableProductVariantCounts,
  AirtableReservationFields,
  AirtableUserFields,
  PrismaProductVariantCounts,
} from "../airtable.types"
import { AirtableBaseService } from "./airtable.base.service"
import { AirtableQueriesService } from "./airtable.queries.service"
import { AirtableUtilsService } from "./airtable.utils.service"

@Injectable()
export class AirtableService extends AirtableQueriesService {
  constructor(
    private readonly _airtableBase: AirtableBaseService,
    private readonly utils: AirtableUtilsService
  ) {
    super(_airtableBase)
  }

  airtableToPrismaInventoryStatus(
    airtableStatus: AirtableInventoryStatus
  ): InventoryStatus {
    return airtableStatus.replace(" ", "") as InventoryStatus
  }

  prismaToAirtableInventoryStatus(
    prismaStatus: InventoryStatus
  ): AirtableInventoryStatus {
    let retVal = prismaStatus as AirtableInventoryStatus
    if (prismaStatus === "NonReservable") {
      retVal = "Non Reservable"
    }
    return retVal
  }

  prismaToAirtableCounts(
    prismaCounts: PrismaProductVariantCounts
  ): AirtableProductVariantCounts {
    return {
      "Non-Reservable Count": prismaCounts.nonReservable,
      "Reservable Count": prismaCounts.reservable,
      "Reserved Count": prismaCounts.reserved,
    }
  }

  airtableToPrismaReservationStatus(airtableStatus: string): ReservationStatus {
    return airtableStatus.replace(" ", "") as ReservationStatus
  }

  async createAirtableReservation(
    userEmail: string,
    data: ReservationCreateInput,
    shippingError: string,
    returnShippingError: string
  ): Promise<[AirtableData, () => void]> {
    const itemIDs = (data.products.connect as { seasonsUID: string }[]).map(
      a => a.seasonsUID
    )
    const airtableUserRecord = await this.utils.getAirtableUserRecordByUserEmail(
      userEmail
    )
    const records = await this.airtableBase.base("Reservations").create([
      {
        fields: {
          ID: data.reservationNumber,
          User: compact([airtableUserRecord?.id]),
          Items: (await this.getPhysicalProducts(itemIDs)).map(a => a.id),
          Shipped: false,
          Status: "Queued",
          "Shipping Address": compact(
            airtableUserRecord?.fields["Shipping Address"]
          ),
          "Shipping Label": data.sentPackage.create.shippingLabel.create.image,
          "Tracking URL":
            data.sentPackage.create.shippingLabel.create.trackingURL,
          "Return Label":
            data.returnedPackage.create.shippingLabel.create.image,
          "Return Tracking URL":
            data.returnedPackage.create.shippingLabel.create.trackingURL,
          "Shipping Error": shippingError,
          "Return Shipping Error": returnShippingError,
        },
      },
    ])

    const rollbackAirtableReservation = async () => {
      const numDeleted = await this.airtableBase
        .base("Reservations")
        .destroy([records[0].getId()])
      return numDeleted
    }
    return [records[0], rollbackAirtableReservation]
  }

  async updateReservation(resnum: number, fields: AirtableReservationFields) {
    return await this.updateRecord(
      "Reservations",
      head(await this.getReservation(resnum))?.id,
      fields
    )
  }

  private async updateRecord(
    modelName: AirtableModelName,
    recordId: string,
    fields
  ) {
    return await this.airtableBase.base(modelName).update(recordId, fields)
  }

  async createPhysicalProducts(newPhysicalProducts) {
    await this.airtableBase
      .base("Physical Products")
      .create(newPhysicalProducts)
  }

  async updatePhysicalProducts(
    airtableIDs: string[],
    fields: AirtablePhysicalProductFields[]
  ) {
    if (airtableIDs.length !== fields.length && fields.length !== 1) {
      throw new Error(
        "airtableIDs and fields must be arrays of equal length OR fields must be a length 1 array"
      )
    }
    if (airtableIDs.length < 1 || airtableIDs.length > 10) {
      throw new Error("please include one to ten airtable record IDs")
    }

    let formattedFields = fields
    if (fields.length === 1 && airtableIDs.length !== 1) {
      formattedFields = airtableIDs.map(a => fields[0])
    }

    const formattedUpdateData = zip(airtableIDs, formattedFields).map(a => {
      return {
        id: a[0],
        fields: a[1],
      }
    })
    const updatedRecords = await this.airtableBase
      .base("Physical Products")
      .update(formattedUpdateData)
    return updatedRecords
  }

  async updateProductVariantCounts(
    airtableID: string,
    counts: AirtableProductVariantCounts
  ) {
    return this.airtableBase.base("Product Variants").update(airtableID, counts)
  }
}
