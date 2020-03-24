import { Identity } from "../../utils"
import { getAllHomepageProductRails, getAllProducts } from "../utils"
import { getProductionBase, getStagingBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
  linkStagingRecords,
  getProductRecordIdentifer,
} from "."

export const syncHomepageProductRails = async (cliProgressBar?) => {
  const allProductionRecs = await getAllHomepageProductRails(
    getProductionBase()
  )
  await deleteAllStagingRecords("Homepage Product Rails", cliProgressBar)
  await createAllStagingRecordsWithoutLinks({
    modelName: "Homepage Product Rails",
    allProductionRecords: allProductionRecs,
    sanitizeFunc: fields => Identity({ ...fields, Products: [] }),
    cliProgressBar,
  })

  await addProductsLinks(
    allProductionRecs,
    await getAllHomepageProductRails(getStagingBase()),
    cliProgressBar
  )
}

export const getNumLinksHomepageProductRails = () => 1

const addProductsLinks = async (
  allProductionRecords,
  allStagingRecords,
  cliProgressBar?
) => {
  await linkStagingRecords({
    rootRecordName: "Homepage Product Rails",
    targetFieldNameOnRootRecord: "Products",
    allRootProductionRecords: allProductionRecords,
    allRootStagingRecords: allStagingRecords,
    allTargetProductionRecords: await getAllProducts(getProductionBase()),
    allTargetStagingRecords: await getAllProducts(getStagingBase()),
    getRootRecordIdentifer: rec => rec.fields.Slug,
    getTargetRecordIdentifer: getProductRecordIdentifer,
    cliProgressBar,
  })
}
