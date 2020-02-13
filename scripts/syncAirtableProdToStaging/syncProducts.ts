import {
  getAllProducts,
  getAllBrands,
  AirtableData,
} from "../../src/airtable/utils"
import { stagingBase, productionBase } from "./"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"

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
  const allStagingProducts = await getAllProducts(stagingBase)
  const allStagingBrands = await getAllBrands(stagingBase)
  const allProductionBrands = await getAllBrands(productionBase)
  for (const productionProduct of allProductionProducts) {
    if (!productionProduct.fields.Brand) {
      continue
    }
    if (productionProduct.fields.Brand.length === 1) {
      await setProductBrand(productionProduct)
    }
  }

  // ***********
  async function setProductBrand(productionProd) {
    const correspondingStagingProduct = allStagingProducts.find(
      sp => sp.fields.Slug === productionProd.fields.Slug
    )
    const productionBrand = allProductionBrands.findByIds(
      productionProd.fields.Brand
    )
    const stagingBrand = allStagingBrands.find(
      sb => sb.fields.Name === productionBrand.fields.Name
    )
    await stagingBase("Products").update([
      {
        id: correspondingStagingProduct.id,
        fields: {
          Brand: [stagingBrand.id],
        },
      },
    ])
  }
}
