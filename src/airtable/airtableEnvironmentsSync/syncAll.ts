import {
  syncColors,
  syncBrands,
  syncModels,
  syncCategories,
  syncLocations,
  syncProducts,
  syncHomepageProductRails,
  syncProductVariants,
  syncPhysicalProducts,
  syncUsers,
  syncReservations,
} from "./"

export const sync = async () => {
  // Note that the order matters here in order to properly link between tables.
  await syncColors()
  await syncBrands()
  await syncModels()
  await syncCategories()
  await syncLocations()
  await syncProducts()
  await syncHomepageProductRails()
  await syncProductVariants()
  await syncPhysicalProducts()
  await syncUsers()
  await syncReservations()
}
