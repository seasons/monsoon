import { syncBrands, syncCategories, syncProducts } from "."

export const syncAll = async () => {
  //   await syncBrands()
  await syncCategories()
  await syncProducts()
}
