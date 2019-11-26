import { base } from "./config"
import {
  ReservationCreateInput,
  LocationCreateInput,
  LocationCreateOneInput,
  BillingInfoCreateInput,
} from "../prisma"
import slugify from "slugify"

interface AirtableData extends Array<any> {
  findByIds: (ids?: any) => any
  findMultipleByIds: (ids?: any) => any[]
}

const getAll: (
  name: string,
  filterFormula?: string
) => Promise<AirtableData> = async (name, filterFormula) => {
  let data = [] as AirtableData

  data.findByIds = (ids = []) => {
    return data.find(record => ids.includes(record.id))
  }

  data.findMultipleByIds = (ids = []) => {
    return data.filter(record => ids.includes(record.id))
  }

  return new Promise((resolve, reject) => {
    const options: { view: string; filterByFormula?: string } = {
      view: "Grid view",
    }

    if (filterFormula && filterFormula.length) {
      options.filterByFormula = filterFormula
    }

    base(name)
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

export const getAllBrands = async () => {
  return getAll("Brands")
}

export const getAllCollections = async () => {
  return getAll("Collections")
}

export const getAllCollectionGroups = async () => {
  return getAll("Collection Groups")
}

export const getAllUsers = async () => {
  return getAll("Users")
}

export const getAllCategories = async () => {
  return getAll("Categories")
}

export const getAllColors = async () => {
  return getAll("Colors")
}

export const getAllHomepageProductRails = async () => {
  return getAll("Homepage Product Rails")
}

export const getAllProducts = async () => {
  return getAll("Products")
}

export const getAllProductVariants = async () => {
  return getAll("Product Variants")
}

export const getAllPhysicalProducts = async () => {
  return getAll("Physical Products")
}

export const getAllLocations = async () => {
  return getAll("Locations")
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

export const createReservation = async (
  userEmail: string,
  data: ReservationCreateInput,
  shippingError: string,
  returnShippingError: string
) => {
  try {
    const itemIDs = (data.products.connect as { seasonsUID: string }[]).map(
      a => a.seasonsUID
    )
    const items = await getPhysicalProducts(itemIDs)
    const airtableUserRecord = await getAirtableUserRecordByUserEmail(userEmail)
    const createData = [
      {
        fields: {
          ID: data.reservationNumber,
          User: [airtableUserRecord.id],
          "Current Location": [process.env.NEXT_CLEANERS_AIRTABLE_LOCATION_ID],
          Items: items.map(a => a.id),
          Shipped: false,
          Status: "New",
          "Shipping Address": airtableUserRecord.fields["Shipping Address"],
          "Shipping Label": data.shippingLabel.create.image,
          "Tracking URL": data.shippingLabel.create.trackingURL,
          "Return Label": data.returnLabel.create.image,
          "Return Tracking URL": data.returnLabel.create.trackingURL,
          "Shipping Error": shippingError,
          "Return Shipping Error": returnShippingError,
        },
      },
    ]

    const records = await base("Reservations").create(createData)
    return records
  } catch (e) {
    console.log(e)
    throw e
  }
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
