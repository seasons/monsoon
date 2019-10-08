import {
  syncBrands,
  syncCategories,
  syncColors,
  syncProducts,
  syncProductVariants,
} from "."

export const syncAll = async () => {
  await syncBrands()
  await syncCategories()
  await syncColors()
  await syncProducts()
  await syncProductVariants()
}
