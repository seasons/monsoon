import {
  getAllProductVariants,
  getAllProducts,
  createTopSize,
  createBottomSize,
} from "../../src/airtable/utils"
import { base } from "../../src/airtable/config"

const run = async () => {
  // Get all the product variant records
  const allAirtableProductVariants = await getAllProductVariants()
  const allAirtableProducts = await getAllProducts()

  let i = 0
  // For each record, create a size record, then link it.
  for (const prodVarRecord of allAirtableProductVariants) {
    console.log(`prodVar ${i++} of ${allAirtableProductVariants.length}`)
    try {
      const { model, id } = prodVarRecord

      // Get the type of the record from the product
      const correspondingProductRecord = allAirtableProducts.findByIds(
        model.product
      )
      if (!correspondingProductRecord) {
        continue
      }
      const { type } = correspondingProductRecord.model
      switch (type) {
        case "Top":
          if (!!model.topSize) {
            continue
          }
          const {
            bodyLength: length,
            sleeveLength: sleeve,
            shoulderWidth: shoulder,
            chestWidth: chest,
            size: letter,
          } = model
          // Make topSize record and link it
          const topSizeRecord = await createTopSize({
            length,
            sleeve,
            shoulder,
            chest,
            letter,
            name: model.sKU,
          })
          await base("Product Variants").update(id, {
            "Top Size": [topSizeRecord[0].id],
          })
          break
        case "Bottom":
          if (!!model.bottomSize) {
            continue
          }
          const { waist, rise, hem, bodyLength: inseam } = model
          // Make bottomSize record and link it
          const bottomSizeRecord = await createBottomSize({
            waist,
            rise,
            hem,
            inseam,
            name: model.sKU,
          })
          await base("Product Variants").update(id, {
            "Bottom Size": [bottomSizeRecord[0].id],
          })
          break
      }
    } catch (e) {
      console.log(e)
    }
  }
}

run()
