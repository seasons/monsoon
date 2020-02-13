import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"
import {
  getAllHomepageProductRails,
  getAllProducts,
} from "../../src/airtable/utils"
import { productionBase, stagingBase } from "."
import { linkStagingRecords } from "./linkStagingRecords"

export const syncHomepageProductRails = async () => {
  console.log(" -- Homepage Product Rails -- ")

  const allProductionRecs = await getAllHomepageProductRails(productionBase)
  await deleteAllStagingRecords("Homepage Product Rails")
  await createAllStagingRecordsWithoutLinks(
    "Homepage Product Rails",
    allProductionRecs,
    fields => {
      return { ...fields, Products: [] }
    }
  )

  await addProductsLinks(
    allProductionRecs,
    await getAllHomepageProductRails(stagingBase)
  )
}

const addProductsLinks = async (allProductionRecords, allStagingRecords) => {
  await linkStagingRecords({
    rootRecordName: "Homepage Product Rails",
    targetFieldNameOnRootRecord: "Products",
    allRootProductionRecords: allProductionRecords,
    allRootStagingRecords: allStagingRecords,
    allTargetProductionRecords: await getAllProducts(productionBase),
    allTargetStagingRecords: await getAllProducts(stagingBase),
    getRootRecordIdentifer: rec => rec.fields.Slug,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
  })
}
