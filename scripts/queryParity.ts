import { request } from "graphql-request"
import expect from "expect"

const queries = {
  products: `{
    products {
        id
    }
    }`,
}
const oURL = "https://monsoon-staging.herokuapp.com"
const nURL = "https://monsoon-nest-staging.herokuapp.com"

const run = async () => {
  for (const key of Object.keys(queries)) {
    const oResult = await request(oURL, queries[key])
    const nResult = await request(nURL, queries[key])
    expect(nResult).toStrictEqual(oResult)
  }
  console.log("All queries equal!")
}

run()
