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
import cliProgress from "cli-progress"
import {
  getNumRecords,
  AirtableModelName,
  makeAirtableSyncCliProgressBar,
} from "../utils"
import { createSubBar } from "./utils"

export const syncAll = async () => {
  const multibar = makeAirtableSyncCliProgressBar()

  const bars = {
    brands: await createSubBar({ multibar, modelName: "Brands" }),
    categories: await createSubBar({
      multibar,
      modelName: "Categories",
      numRecordsModifier: n => n * 2,
    }),
    colors: await createSubBar({ multibar, modelName: "Colors" }),
    products: await createSubBar({ multibar, modelName: "Products" }),
    productVariants: await createSubBar({
      multibar,
      modelName: "Product Variants",
    }),
    physicalProducts: await createSubBar({
      multibar,
      modelName: "Physical Products",
    }),
    collections: await createSubBar({ multibar, modelName: "Collections" }),
    collectionGroups: await createSubBar({
      multibar,
      modelName: "Collection Groups",
    }),
    homepageProductRails: await createSubBar({
      multibar,
      modelName: "Homepage Product Rails",
    }),
  }

  try {
    await syncBrands(bars.brands)
    await syncCategories(bars.categories)
    await syncColors(bars.colors)
    await syncProducts(bars.products)
    // await syncProductVariants()
    //   await syncPhysicalProducts()
    //   await syncCollections()
    //   await syncCollectionGroups()
    //   await syncHomepageProductRails()
  } catch (e) {
    console.log(e)
  } finally {
    multibar.stop()
  }
}

// syncAll()
