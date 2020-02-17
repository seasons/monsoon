import * as Airtable from "airtable"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

export const productionBase = Airtable.base(process.env.AIRTABLE_DATABASE_ID)
export const stagingBase = Airtable.base(process.env._STAGING_AIRTABLE_BASEID) // test base
