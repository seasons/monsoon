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
