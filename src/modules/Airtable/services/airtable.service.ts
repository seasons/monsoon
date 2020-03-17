import { Injectable } from "@nestjs/common"
import { 
  PhysicalProduct,
  ReservationCreateInput,
  CustomerDetailCreateInput,
  BillingInfoCreateInput,
  CustomerStatus,
  User
} from "../../../prisma"
import { fill, zip } from "lodash"
import { AirtableUtilsService } from "./airtable.utils.service"
import { AirtableBaseService } from "./airtable.base.service"

interface AirtableUserFields extends CustomerDetailCreateInput {
  plan?: string
  status?: CustomerStatus
  billingInfo?: BillingInfoCreateInput
}

export interface AirtableData extends Array<any> {
  findByIds: (ids?: any) => any
  findMultipleByIds: (ids?: any) => any[]
  fields: any
}

export type AirtableInventoryStatus =
  | "Reservable"
  | "Non Reservable"
  | "Reserved"

// Add to this as needed
export type AirtablePhysicalProductFields = {
  "Inventory Status": AirtableInventoryStatus
}

@Injectable()
export class AirtableService {
  constructor(
    private readonly airtableBase: AirtableBaseService,
    private readonly utils: AirtableUtilsService) {}

  getAllProductVariants(airtableBase?) {
    return this.getAll("Product Variants", "", "", airtableBase)
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

  async createAirtableReservation(
    userEmail: string,
    data: ReservationCreateInput,
    shippingError: string,
    returnShippingError: string
  ): Promise<[AirtableData, () => void]> {
    return new Promise(async (resolve, reject) => {
      try {
        const itemIDs = (data.products.connect as { seasonsUID: string }[]).map(
          a => a.seasonsUID
        )
        const items = await this.getPhysicalProducts(itemIDs)
        const airtableUserRecord = await this.utils.getAirtableUserRecordByUserEmail(
          userEmail
        )
        const nextCleanersAirtableRecord = await this.utils.getAirtableLocationRecordBySlug(
          process.env.NEXT_CLEANERS_AIRTABLE_SLUG
        )
        const createData = [
          {
            fields: {
              ID: data.reservationNumber,
              User: [airtableUserRecord.id],
              "Current Location": [nextCleanersAirtableRecord.id],
              Items: items.map(a => a.id),
              Shipped: false,
              Status: "New",
              "Shipping Address": airtableUserRecord.fields["Shipping Address"],
              "Shipping Label":
                data.sentPackage.create.shippingLabel.create.image,
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
        ]
        const records = await this.airtableBase.base("Reservations").create(createData)

        const rollbackAirtableReservation = async () => {
          const numDeleted = await this.airtableBase.base("Reservations").destroy([
            records[0].getId(),
          ])
          return numDeleted
        }
        return resolve([records[0], rollbackAirtableReservation])
      } catch (err) {
        return reject(err)
      }
    })
  }

  async createOrUpdateAirtableUser (
    user: User,
    fields: AirtableUserFields
  ) {
    // Create the airtable data
    const { email, firstName, lastName } = user
    const data = {
      Email: email,
      "First Name": firstName,
      "Last Name": lastName,
    }
    for (let key in fields) {
      if (this.utils.keyMap[key]) {
        data[this.utils.keyMap[key]] = fields[key]
      }
    }
    // WARNING: shipping address and billingInfo code are still "create" only.
    if (!!fields.shippingAddress) {
      const location = await this.utils.createLocation(fields.shippingAddress.create)
      data["Shipping Address"] = location.map(l => l.id)
    }
    if (!!fields.billingInfo) {
      const airtableBillingInfoRecord = await this.utils.createBillingInfo(
        fields.billingInfo
      )
      data["Billing Info"] = [airtableBillingInfoRecord.getId()]
    }
  
    // Create or update the record
    this.airtableBase.base("Users")
      .select({
        view: "Grid view",
        filterByFormula: `{Email}='${email}'`,
      })
      .firstPage((err, records) => {
        if (err) {
          throw err
        }
        if (records.length > 0) {
          const user = records[0]
          this.airtableBase.base("Users").update(user.id, data, function(err, record) {
            if (err) {
              throw err
            }
          })
        } else {
          this.airtableBase.base("Users").create([
            {
              fields: data,
            },
          ])
        }
      })
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

  private async updatePhysicalProducts(
    airtableIDs: [string],
    fields: [AirtablePhysicalProductFields]
  ) {
    if (airtableIDs.length !== fields.length) {
      throw new Error("airtableIDs and fields must be arrays of equal length")
    }
    if (airtableIDs.length < 1 || airtableIDs.length > 10) {
      throw new Error("please include one to ten airtable record IDs")
    }

    const formattedUpdateData = zip(airtableIDs, fields).map(a => {
      return {
        id: a[0],
        fields: a[1],
      }
    })
    const updatedRecords = await this.airtableBase.base("Physical Products").update(
      formattedUpdateData
    )
    return updatedRecords
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

  private getPhysicalProducts(SUIDs: string[]) {
    const formula = `OR(${SUIDs.map(a => `{SUID}='${a}'`).join(",")})`
    return this.getAll("Physical Products", formula)
  }
}
