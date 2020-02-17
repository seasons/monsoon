import * as Airtable from "airtable"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

export const base = Airtable.base(process.env.AIRTABLE_DATABASE_ID)

export const getProductionBase = () => {
  if (!process.env._PRODUCTION_AIRTABLE_BASEID) {
    throw new Error("_PRODUCTION_AIRTABLE_BASEID not set")
  }
  return Airtable.base(process.env._PRODUCTION_AIRTABLE_BASEID)
}

export const getStagingBase = () => {
  if (!process.env._STAGING_AIRTABLE_BASEID) {
    throw new Error("_STAGING_AIRTABLE_BASEID not set")
  }
  return Airtable.base(process.env._STAGING_AIRTABLE_BASEID)
}
