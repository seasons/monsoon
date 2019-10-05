import * as Airtable from "airtable"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})
export const base = Airtable.base("appvmn48T0eEl4lGV")
export const graphqlURL =
  process.env.MIST_GRAPHQL_ENDPOINT ||
  "https://mist-staging.herokuapp.com/graphql"
