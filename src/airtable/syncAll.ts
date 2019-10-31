import {
  syncBrands,
  syncCategories,
  syncColors,
  syncLocations,
  syncProducts,
  syncProductVariants,
  syncCollections,
  syncCollectionGroup
} from "."

export const syncAll = async () => {
  await syncBrands()
  await syncCategories()
  await syncColors()
  await syncLocations()
  await syncProducts()
  await syncProductVariants()
  await syncCollections()
  await syncCollectionGroup()
}
