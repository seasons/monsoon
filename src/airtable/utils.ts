import { base } from "./config"

const getAll: (name: string) => Promise<any[]> = async name => {
  let data = []
  return new Promise((resolve, reject) => {
    base(name)
      .select({
        view: "Grid view",
      })
      .eachPage(
        (records, fetchNextPage) => {
          data = data.concat(records)
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
