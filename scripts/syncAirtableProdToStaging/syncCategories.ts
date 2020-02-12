import { getAllCategories } from "../../src/airtable/utils"
import { productionBase, stagingBase } from "./index"
import { deleteAllStagingRecords } from "./utils"

export const syncCategories = async () => {
  console.log(" -- Categories -- ")

  const allProductionCategories = await getAllCategories(productionBase)
  await deleteAllStagingRecords("Categories")

  // Create records
  for (const category of allProductionCategories) {
    await stagingBase("Categories").create([
      {
        fields: {
          ...category.fields,
          // (?TODO) Avoid complexity of linking image for now
          Image: [],
          // Will link in next for loop
          Parent: [],
          // Will link in later function call
          Products: [],
        },
      },
    ])
  }

  // Add links to parent category
  const allStagingCategories = await getAllCategories(stagingBase)
  for (const productionCategory of allProductionCategories) {
    if (!productionCategory.fields.Parent) {
      continue
    }
    if (productionCategory.fields.Parent.length === 1) {
      const [childId, parentId] = getStagingChildAndParentIds(
        allProductionCategories,
        allStagingCategories,
        productionCategory
      )
      await stagingBase("Categories").update([
        {
          id: childId,
          fields: {
            Parent: [parentId],
          },
        },
      ])
    }
  }
}
const getStagingChildAndParentIds = (
  allProductionCategories,
  allStagingCategories,
  productionCategory
) => {
  const parentCategoryProductionRecord = allProductionCategories.find(
    c => c.id === productionCategory.fields.Parent[0]
  )
  const parentCategoryStagingRecord = allStagingCategories.find(
    c => c.fields.Name === parentCategoryProductionRecord.fields.Name
  )
  const correspondingCategoryOnStaging = allStagingCategories.find(
    c => c.fields.Name === productionCategory.fields.Name
  )
  return [correspondingCategoryOnStaging.id, parentCategoryStagingRecord.id]
}
