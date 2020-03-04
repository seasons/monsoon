import { AirtableModelName } from "../utils"
import { airtableModelNameToGetAllFunc } from "./utils"
import { getProductionBase, getStagingBase } from "../config"
import { union, difference } from "lodash"

export const checkAllTableAlignment = async () => {
  await checkTableAlignment("Colors")
  await checkTableAlignment("Brands")
  await checkTableAlignment("Models")
  await checkTableAlignment("Categories")
  await checkTableAlignment("Locations")
  await checkTableAlignment("Products")
  await checkTableAlignment("Homepage Product Rails")
  await checkTableAlignment("Product Variants")
  await checkTableAlignment("Physical Products")
  await checkTableAlignment("Users")
  await checkTableAlignment("Reservations")
}

const checkTableAlignment = async (modelName: AirtableModelName) => {
  const allRecordsProduction = await airtableModelNameToGetAllFunc(modelName)(
    getProductionBase()
  )
  const allRecordsStaging = await airtableModelNameToGetAllFunc(modelName)(
    getStagingBase()
  )

  // Check column names
  const productionColumnNames = allRecordsProduction.reduce((acc, curVal) => {
    return union(acc, Object.keys(curVal.fields))
  }, [])
  const stagingColumnNames = allRecordsStaging.reduce((acc, curVal) => {
    return union(acc, Object.keys(curVal.fields))
  }, [])
  const diff = difference(productionColumnNames, stagingColumnNames)
  if (diff.length !== 0) {
    console.log(
      `You may need to add the following columns to the ${modelName} table on the target base:`
    )
    diff.forEach(a => console.log(`--${a}`))
  }
}
