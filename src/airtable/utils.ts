import { base } from "./config"
import {
  ReservationCreateInput,
  LocationCreateInput,
  LocationCreateOneInput,
  BillingInfoCreateInput,
} from "../prisma"
import slugify from "slugify"

export interface AirtableData extends Array<any> {
  findByIds: (ids?: any) => any
  findMultipleByIds: (ids?: any) => any[]
  fields: any
}
export type AirtableModeName = "Colors" | "Brands" | "Models" | "Categories"

const getAll: (
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
  const baseToUse = airtableBase || base

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
            record.model = airtableToPrismaObject(record.fields)
            data.push(record)
          })
          return fetchNextPage()
        },
        function done(err) {
          if (err) {
            console.error(err)
            reject(err)
            return
          }
          resolve(data)
        }
      )
  })
}

export const getAllBrands = async (airtableBase?) => {
  return getAll("Brands", "", "", airtableBase)
}

export const getAllModels = async (airtableBase?) => {
  return getAll("Models", "", "", airtableBase)
}

export const getAllReservations = async (airtableBase?) => {
  return getAll("Reservations", "", "", airtableBase)
}

export const getAllCollections = async (airtableBase?) => {
  return getAll("Collections", "", "", airtableBase)
}

export const getAllCollectionGroups = async (airtableBase?) => {
  return getAll("Collection Groups", "", "", airtableBase)
}

export const getAllUsers = async (airtableBase?) => {
  return getAll("Users", "", "", airtableBase)
}

export const getAllCategories = async (airtableBase?) => {
  return getAll("Categories", "", "", airtableBase)
}

export const getAllColors = async (airtableBase?) => {
  return getAll("Colors", "", "", airtableBase)
}

export const getAllHomepageProductRails = async (airtableBase?) => {
  return getAll("Homepage Product Rails", "", "", airtableBase)
}

export const getAllProducts = async (airtableBase?) => {
  return getAll("Products", "", "", airtableBase)
}

export const getAllProductVariants = async (airtableBase?) => {
  return getAll("Product Variants", "", "", airtableBase)
}

export const getAllPhysicalProducts = async (airtableBase?) => {
  return getAll("Physical Products", "", "", airtableBase)
}

export const getAllLocations = async (airtableBase?) => {
  return getAll("Locations", "", "", airtableBase)
}

export const airtableToPrismaObject = record => {
  function camelCase(str) {
    return str
      .replace(/\s(.)/g, function(a) {
        return a.toUpperCase()
      })
      .replace(/\s/g, "")
      .replace(/^(.)/, function(b) {
        return b.toLowerCase()
      })
  }

  const obj = {}
  for (let id of Object.keys(record)) {
    let newKey = camelCase(id)
    obj[newKey] = record[id]
  }
  return obj
}

export async function createAirtableReservation(
  userEmail: string,
  data: ReservationCreateInput,
  shippingError: string,
  returnShippingError: string
): Promise<[AirtableData, Function]> {
  return new Promise(async function(resolve, reject) {
    try {
      const itemIDs = (data.products.connect as { seasonsUID: string }[]).map(
        a => a.seasonsUID
      )
      const items = await getPhysicalProducts(itemIDs)
      const airtableUserRecord = await getAirtableUserRecordByUserEmail(
        userEmail
      )
      const createData = [
        {
          fields: {
            ID: data.reservationNumber,
            User: [airtableUserRecord.id],
            "Current Location": [
              process.env.NEXT_CLEANERS_AIRTABLE_LOCATION_ID,
            ],
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
      const records = await base("Reservations").create(createData)

      const rollbackAirtableReservation = async () => {
        const numDeleted = await base("Reservations").destroy([
          records[0].getId(),
        ])
        return numDeleted
      }
      resolve([records[0], rollbackAirtableReservation])
    } catch (err) {
      reject(err)
    }
  })
}

export const createLocation = async (user, data: LocationCreateInput) => {
  const createData = [
    {
      fields: {
        Name: data.name,
        Company: data.company,
        "Address 1": data.address1,
        "Address 2": data.address2,
        City: data.city,
        State: data.state,
        "Zip Code": data.zipCode,
        Slug: data.slug,
        "Location Type": data.locationType,
      },
    },
  ]

  return base("Locations").create(createData)
}

export async function createBillingInfo(data: BillingInfoCreateInput) {
  return base("BillingInfos").create({
    Brand: data.brand,
    Name: data.name,
    LastDigits: data.last_digits,
    "Expiration Month": data.expiration_month,
    "Expiration Year": data.expiration_year,
    "Street 1": data.street1,
    "Street 2": data.street2,
    City: data.city,
    State: data.state,
    Country: data.country,
    "Postal Code": data.postal_code,
  })
}

export const getProductVariant = (SKU: string) => {
  return getAll("Product Variants", `{SKU}=${SKU}`)
}

export const getPhysicalProducts = (SUIDs: string[]) => {
  const formula = `OR(${SUIDs.map(a => `{SUID}='${a}'`).join(",")})`
  return getAll("Physical Products", formula)
}

export const updateProductVariant = async data => {
  return new Promise((resolve, reject) => {
    base("Reservations").create([{}], (err, records) => {
      if (records.length > 0) {
        const user = records[0]
        resolve(user)
      } else {
        reject(err)
      }
    })
  })
}

export function getAirtableUserRecordByUserEmail(
  email: string
): Promise<{ id: string; fields: any }> {
  return new Promise(function retrieveUser(resolve, reject) {
    base("Users")
      .select({
        view: "Grid view",
        filterByFormula: `{Email}='${email}'`,
      })
      .firstPage((err, records) => {
        if (records.length > 0) {
          const user = records[0]
          resolve(user)
        } else {
          reject(err)
        }
      })
  })
}
