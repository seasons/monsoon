import { request } from "graphql-request"
import expect from "expect"

const productFields = `
id
slug
name
brand {
  id
}
category {
  id
}
type
description
externalURL
images
modelHeight
modelSize {
  id
  display
}
retailPrice
color {
  id
}
tags
functions {
  id
}
innerMaterials
outerMaterials
variants {
  id
}
status
isSaved
createdAt
updatedAt`

const brandFields = `
id
slug
brandCode
description
isPrimaryBrand
logo
name
basedIn
products {
  id
}
since
tier
websiteUrl
createdAt
updatedAt
`
const queries = {
  brand: `
  {
    brand(where: {brandCode: "CAVE"}) {
      ${brandFields}
    }
  }
  `,
  brands: `
  {
    brands(orderBy: id_ASC) {
      ${brandFields}
    }
  }`,
}
const oURL = "https://monsoon-staging.herokuapp.com"
const nURL = "https://monsoon-nest-staging.herokuapp.com"

const run = async () => {
  let didError = false
  for (const key of Object.keys(queries)) {
    const oResult = await request(oURL, queries[key])
    const nResult = await request(nURL, queries[key])
    try {
      expect(nResult).toStrictEqual(oResult)
      console.log(`"${key}" passes`)
    } catch (e) {
      didError = true
      console.log(`"${key}" failed`)
      console.log(e)
    }
  }
  !didError && console.log("All queries equal!")
}

run()
