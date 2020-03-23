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
} from "."
import cliProgress from "cli-progress"
import { getNumReadWritesToSyncModel } from "./utils"
import { AirtableModelName } from "../utils"
import { checkAllTableAlignment } from "./checkTableAlignment"
import { syncSizes } from "./syncSizes"
import { syncTopSizes } from "./syncTopSizes"
import { syncBottomSizes } from "./syncBottomSizes"

export const syncAll = async () => {
  // Note that the order matters here in order to properly link between tables.

  console.log(
    `\nNote: If you encounter errors, it's probably a field configuration issue on the destination base\n`
  )
  console.log(
    `Checking table alignments to surface would-be sync errors early...`
  )
  // await checkAllTableAlignment()
  const multibar = new cliProgress.MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      format: `{modelName} {bar} {percentage}%  ETA: {eta}s  {value}/{total} ops`,
    },
    cliProgress.Presets.shades_grey
  )
  const bars = {
    colors: await createSubBar(multibar, "Colors"),
    brands: await createSubBar(multibar, "Brands"),
    models: await createSubBar(multibar, "Models"),
    categories: await createSubBar(multibar, "Categories"),
    locations: await createSubBar(multibar, "Locations"),
    sizes: await createSubBar(multibar, "Sizes"),
    topSizes: await createSubBar(multibar, "Top Sizes"),
    bottomSizes: await createSubBar(multibar, "Bottom Sizes"),
    products: await createSubBar(multibar, "Products"),
    homepageProductRails: await createSubBar(
      multibar,
      "Homepage Product Rails"
    ),
    productVariants: await createSubBar(multibar, "Product Variants"),
    physicalProducts: await createSubBar(multibar, "Physical Products"),
    users: await createSubBar(multibar, "Users"),
    reservations: await createSubBar(multibar, "Reservations"),
  }
  try {
    await syncColors(bars.colors)
    await syncBrands(bars.brands)
    await syncModels(bars.models)
    await syncCategories(bars.categories)
    await syncLocations(bars.locations)
    await syncSizes(bars.sizes)
    await syncTopSizes(bars.topSizes)
    await syncBottomSizes(bars.bottomSizes)
    await syncProducts(bars.products)
    await syncHomepageProductRails(bars.homepageProductRails)
    await syncProductVariants(bars.productVariants)
    await syncPhysicalProducts(bars.physicalProducts)
    await syncUsers(bars.users)
    await syncReservations(bars.reservations)
  } catch (err) {
    console.log(err)
  } finally {
    multibar.stop()
  }
}

const createSubBar = async (multibar, modelName: AirtableModelName) => {
  return multibar.create(await getNumReadWritesToSyncModel(modelName), 0, {
    modelName: `${modelName}:`.padEnd("Homepage Product Rails".length + 1, " "),
  })
}