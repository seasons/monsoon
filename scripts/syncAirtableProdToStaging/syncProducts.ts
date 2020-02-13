import { getAllProducts } from "../../src/airtable/utils"
import { stagingBase, productionBase } from "./"
import { deleteAllStagingRecords } from "./utils"

export const syncProducts = async () => {
  console.log(" -- PRODUCTS -- ")

  const allProds = await getAllProducts(productionBase)
  await deleteAllStagingRecords("Products")
  for (const prod of allProds) {
    await stagingBase("Products").create([
      {
        fields: {
          ...prod.fields,
          Brand: [],
          Model: [],
          "Product Variants": [],
          "Physical Products": [],
          Categories: [],
        },
      },
    ])
  }
  // Link Brands
  // Link Model
  // Link Categories
}
