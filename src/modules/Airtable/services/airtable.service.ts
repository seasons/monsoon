import * as Airtable from "airtable"

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
import { AirtableUtilsService } from "./airtable.utils.service"

@Injectable()
export class AirtableService {
  constructor(
    private readonly airtableBase: AirtableBaseService,
    private readonly utils: AirtableUtilsService
  ) {}

  // ***************** MUTATIONS AND UTILS ****************
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
          Status: "New",
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

  async createOrUpdateAirtableUser(user: User, fields: AirtableUserFields) {
    // Create the airtable data
    const { email, firstName, lastName } = user
    const data = {
      Email: email,
      "First Name": firstName,
      "Last Name": lastName,
    }
    for (const key in fields) {
      if (this.utils.keyMap[key]) {
        data[this.utils.keyMap[key]] = fields[key]
      }
    }
    // WARNING: shipping address and billingInfo code are still "create" only.
    if (!!fields.shippingAddress) {
      const location = await this.utils.createLocation(
        fields.shippingAddress.create
      )
      data["Shipping Address"] = location.map(l => l.id)
    }
    if (!!fields.billingInfo) {
      const airtableBillingInfoRecord = await this.utils.createBillingInfo(
        fields.billingInfo
      )
      data["Billing Info"] = [airtableBillingInfoRecord.getId()]
    }

    // Create or update the record
    const airtableUser = await this.utils.getAirtableUserRecordByUserEmail(
      email
    )
    if (!!airtableUser) {
      return await this.airtableBase.base("Users").update(airtableUser.id, data)
    }

    return await this.airtableBase.base("Users").create([
      {
        fields: data,
      },
    ])
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

  async markPhysicalProductsReservedOnAirtable(
    physicalProducts: PhysicalProduct[]
  ): Promise<() => void> {
    // Get the record ids of all relevant airtable physical products
    const airtablePhysicalProductRecords = await this.getPhysicalProducts(
      physicalProducts.map(prod => prod.seasonsUID)
    )
    const airtablePhysicalProductRecordIds = airtablePhysicalProductRecords.map(
      a => a.id
    ) as [string]

    // Update their statuses on airtable
    const airtablePhysicalProductRecordsData = fill(
      new Array(airtablePhysicalProductRecordIds.length),
      {
        "Inventory Status": "Reserved",
      }
    ) as [AirtablePhysicalProductFields]
    await this.updatePhysicalProducts(
      airtablePhysicalProductRecordIds,
      airtablePhysicalProductRecordsData
    )

    // Create and return a rollback function
    const airtablePhysicalProductRecordsRollbackData = fill(
      new Array(airtablePhysicalProductRecordIds.length),
      {
        "Inventory Status": "Reservable",
      }
    ) as [AirtablePhysicalProductFields]
    const rollbackMarkPhysicalProductReservedOnAirtable = async () => {
      await this.updatePhysicalProducts(
        airtablePhysicalProductRecordIds,
        airtablePhysicalProductRecordsRollbackData
      )
    }
    return rollbackMarkPhysicalProductReservedOnAirtable
  }

  async updateProductVariantCounts(
    airtableID: string,
    counts: AirtableProductVariantCounts
  ) {
    return this.airtableBase.base("Product Variants").update(airtableID, counts)
  }

  // **************************** QUERIES **********************

  async getNextPhysicalProductSequenceNumber() {
    const sortedSequenceNumbers = (await this.getAllPhysicalProducts())
      .map(a => parseInt(a.model.sequenceNumber, 10))
      .sort((a, b) => a - b)
    return Math.max(...sortedSequenceNumbers) + 1
  }

  async getAllBrands(airtableBase?) {
    return await this.getAllFromScriptView("Brands", airtableBase)
  }

  async getAllCategories(airtableBase?) {
    return await this.getAllFromScriptView("Categories", airtableBase)
  }

  async getAllCollectionGroups(airtableBase?) {
    return await this.getAllFromScriptView("Collection Groups", airtableBase)
  }

  async getAllCollections(airtableBase?) {
    return await this.getAllFromScriptView("Collections", airtableBase)
  }

  async getAllColors(airtableBase?) {
    return await this.getAllFromScriptView("Colors", airtableBase)
  }

  async getAllHomepageProductRails(airtableBase?) {
    return await this.getAllFromScriptView(
      "Homepage Product Rails",
      airtableBase
    )
  }

  async getAllLocations(airtableBase?) {
    return await this.getAllFromScriptView("Locations", airtableBase)
  }

  async getAllModels(airtableBase?) {
    return await this.getAllFromScriptView("Models", airtableBase)
  }

  async getAllPhysicalProducts(airtableBase?) {
    return await this.getAllFromScriptView("Physical Products", airtableBase)
  }

  getPhysicalProducts(SUIDs: string[]) {
    const formula = `OR(${SUIDs.map(a => `{SUID}='${a}'`).join(",")})`
    return this.getAll("Physical Products", formula)
  }

  getCorrespondingAirtablePhysicalProduct(
    allAirtablePhysicalProducts,
    prismaPhysicalProduct
  ) {
    return allAirtablePhysicalProducts.find(
      physProd => physProd.model.sUID.text === prismaPhysicalProduct.seasonsUID
    )
  }

  async getAllProductVariants(airtableBase?) {
    return await this.getAllFromScriptView("Product Variants", airtableBase)
  }

  getCorrespondingAirtableProductVariant(
    allAirtableProductVariants: AirtableData,
    prismaProductVariant: any
  ) {
    return allAirtableProductVariants.find(
      a => a.model.sKU === prismaProductVariant.sku
    )
  }

  async getAllProducts(airtableBase?) {
    return await this.getAllFromScriptView("Products", airtableBase)
  }

  async getAllReservations(airtableBase?) {
    return await this.getAllFromScriptView("Reservations", airtableBase)
  }

  async getReservation(resevationNumber) {
    return await this.getAll("Reservations", `{ID} = '${resevationNumber}'`)
  }

  async getAllTopSizes(airtableBase?) {
    return await this.getAllFromScriptView("Top Sizes", airtableBase)
  }

  async getAllUsers(airtableBase?) {
    return await this.getAllFromScriptView("Users", airtableBase)
  }

  async getAllBottomSizes(airtableBase?) {
    return await this.getAllFromScriptView("Bottom Sizes", airtableBase)
  }

  async getAllSizes(airtableBase?) {
    return await this.getAllFromScriptView("Sizes", airtableBase)
  }

  async getNumRecords(modelName: AirtableModelName) {
    return (await this.getAll(modelName, "", ""))?.length
  }

  getProductionBase = () => {
    if (!process.env._PRODUCTION_AIRTABLE_BASEID) {
      throw new Error("_PRODUCTION_AIRTABLE_BASEID not set")
    }
    return Airtable.base(process.env._PRODUCTION_AIRTABLE_BASEID)
  }

  getStagingBase = () => {
    if (!process.env._STAGING_AIRTABLE_BASEID) {
      throw new Error("_STAGING_AIRTABLE_BASEID not set")
    }
    return Airtable.base(process.env._STAGING_AIRTABLE_BASEID)
  }

  private getAllFromScriptView(modelName: AirtableModelName, airtableBase?) {
    return this.getAll(modelName, "", "Script", airtableBase)
  }

  private getAll: (
    name: string,
    filterFormula?: string,
    view?: string,
    airtableBase?: any
  ) => Promise<AirtableData> = async (
    name,
    filterFormula,
    view = "Script",
    airtableBase
  ) => {
    const data = [] as AirtableData
    const baseToUse = airtableBase || this.airtableBase.base

    data.findByIds = (ids = []) => {
      return data.find(record => ids.includes(record.id))
    }

    data.findMultipleByIds = (ids = []) => {
      return data.filter(record => ids.includes(record.id))
    }

    return new Promise((resolve, reject) => {
      const options: { view: string; filterByFormula?: string } = {
        view,
      }

      if (filterFormula && filterFormula.length) {
        options.filterByFormula = filterFormula
      }

      baseToUse(name)
        .select(options)
        .eachPage(
          (records, fetchNextPage) => {
            records.forEach(record => {
              record.model = this.airtableToPrismaObject(record.fields)
              data.push(record)
            })
            return fetchNextPage()
          },
          function done(err) {
            if (err) {
              console.error(err)
              return reject(err)
            }
            return resolve(data)
          }
        )
    })
  }

  private airtableToPrismaObject(record) {
    function camelCase(str) {
      return str
        .replace(/\s(.)/g, a => a.toUpperCase())
        .replace(/\s/g, "")
        .replace(/^(.)/, b => b.toLowerCase())
    }

    const obj = {}
    for (const id of Object.keys(record)) {
      const newKey = camelCase(id)
      obj[newKey] = record[id]
    }
    return obj
  }
}
