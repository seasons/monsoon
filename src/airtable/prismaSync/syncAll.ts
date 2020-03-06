import {
  syncBrands,
  syncCategories,
  syncColors,
  syncProducts,
  syncProductVariants,
  syncPhysicalProducts,
  syncCollections,
  syncCollectionGroups,
  syncHomepageProductRails,
} from "."

export const syncAll = async () => {
  await syncBrands()
  await syncCategories()
  await syncColors()
  await syncProducts()
  await syncProductVariants()
  await syncPhysicalProducts()
  await syncCollections()
  await syncCollectionGroups()
  await syncHomepageProductRails()
}
