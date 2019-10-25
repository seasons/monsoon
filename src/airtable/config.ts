import * as Airtable from "airtable"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

const baseID = process.env.AIRTABLE_DATABASE_ID
export const base = Airtable.base(baseID)
export const graphqlURL =
  process.env.MIST_GRAPHQL_ENDPOINT ||
  "https://mist-staging.herokuapp.com/graphql"
