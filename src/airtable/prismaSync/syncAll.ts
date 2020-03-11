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
import { makeAirtableSyncCliProgressBar } from "../utils"
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

  //   ignore locations because of complications with slugs. plus, we dont really use them yet.
  try {
    await syncBrands(bars.brands)
    await syncCategories(bars.categories)
    await syncColors(bars.colors)
    await syncProducts(bars.products)
    await syncProductVariants(bars.productVariants)
    await syncPhysicalProducts(bars.physicalProducts)
    await syncCollections(bars.collections)
    await syncCollectionGroups(bars.collectionGroups)
    await syncHomepageProductRails(bars.homepageProductRails)
  } catch (e) {
    console.log(e)
  } finally {
    multibar.stop()
  }
}

syncAll()
