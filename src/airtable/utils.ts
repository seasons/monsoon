import { base } from "./config"
import { ReservationCreateInput } from "../prisma"

interface AirtableData extends Array<any> {
  findByIds: (ids?: any) => any
}

const getAll: (
  name: string,
  filterFormula?: string
) => Promise<AirtableData> = async (name, filterFormula) => {
  let data = [] as AirtableData

  data.findByIds = (ids = []) => {
    return data.find(record => ids.includes(record.id))
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

export const getAllCategories = async () => {
  return getAll("Categories")
}

export const getAllColors = async () => {
  return getAll("Colors")
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

export const createReservation = async (data: ReservationCreateInput) => {
  const user = await getUserById(data.user)
  const itemIDs = (data.products.connect as { id: string }[]).map(a => a.id)
  const items = await getPhysicalProducts(itemIDs)

  return new Promise((resolve, reject) => {
    base("Reservations").create(
      [
        {
          User: [user.id],
          Items: items,
          Shipped: false,
          Status: "New",
        },
      ],
      (err, records) => {
        if (records.length > 0) {
          resolve(user)
        } else {
          reject(err)
        }
      }
    )
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

export const getUserById: (
  UserCreateInput
) => Promise<{ id: string }> = user => {
  return new Promise((resolve, reject) => {
    base("Users")
      .select({
        view: "Grid view",
        filterByFormula: `{Email}='${user.email}'`,
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
