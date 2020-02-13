import { getAllProducts, getAllBrands } from "../../src/airtable/utils"
import { stagingBase, productionBase } from "./"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"
import { linkStagingRecord } from "./linkStagingRecord"

export const syncProducts = async () => {
  console.log(" -- PRODUCTS -- ")

  const allProds = await getAllProducts(productionBase)
  await deleteAllStagingRecords("Products")
  await createAllStagingRecordsWithoutLinks("Products", allProds, fields => {
    const sanitizedFields = {
      ...fields,
      Brand: [],
      Model: [],
      "Product Variants": [],
      "Physical Products": [],
      Category: [],
      Images: [],
      "Homepage product rail": [],
      Collections: [],
    }
    delete sanitizedFields["Created Date"]
    return sanitizedFields
  })

  // (TODO: Add images)
  await addBrandLinks(allProds)
  // TODO: Link Model
  // TODO: Link Category
  // TODO: Link homepage product rail
  // TODO: Link Collections
}

const addBrandLinks = async allProductionProducts => {
  for (const productionProduct of allProductionProducts) {
    if (!productionProduct.fields.Brand) {
      continue
    }
    if (productionProduct.fields.Brand.length === 1) {
      await linkStagingRecord({
        rootProductionRecord: productionProduct,
        rootRecordName: "Products",
        allRootStagingRecords: await getAllProducts(stagingBase),
        allTargetProductionRecords: await getAllBrands(productionBase),
        allTargetStagingRecords: await getAllBrands(stagingBase),
        matchRootRecords: (prodRec, stagingRec) =>
          prodRec.fields.Slug === stagingRec.fields.Slug,
        matchTargetRecords: (prodRec, stagingRec) =>
          prodRec.fields.Name === stagingRec.fields.Name,
        getTargetProductionIds: rootProdRec => rootProdRec.fields.Brand,
        createFieldsData: targetRecordIds => {
          return { Brand: targetRecordIds }
        },
      })
    }
  }
}
