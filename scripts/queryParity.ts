import { request } from "graphql-request"
import expect from "expect"

const productFields = `
id
slug
name
type
description
externalURL
images
modelHeight
retailPrice
tags
innerMaterials
outerMaterials
status
isSaved
createdAt
updatedAt
brand {
  id
}
category {
  id
}
modelSize {
  id
  display
}
color {
  id
}
secondaryColor {
  id
}
functions {
  id
}
`

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

const productVariantFields = `
id
sku
color {
  id
}
size
internalSize {
  id
}
manufacturerSizes {
  id
}
weight
height
productID
product {
  id
}
retailPrice
physicalProducts {
  id
}
total
reservable
reserved
nonReservable
isSaved
isWanted
createdAt
updatedAt
`
const queries = {
  // brand: `
  // {
  //   brand(where: {brandCode: "CAVE"}) {
  //     ${brandFields}
  //   }
  // }
  // `,
  // brands: `
  // {
  //   brands(orderBy: id_ASC) {
  //     ${brandFields}
  //   }
  // }`,
  // product: `
  // {
  //   product(where: {id: "ck7yztt6j01mh07249657q5mm"}) {
  //     ${productFields}
  //   }
  // }
  // `,
  // products: `
  // {
  //   products(orderBy: id_ASC) {
  //     ${productFields}
  //   }
  // }
  // `,
  // Leave out productVariant, because it doesn't work on staging monsoon.
  // productVariant: `
  // {
  //   productVariant(where: {id: "ck7z02bis0erv0724lp10lyop"}) {
  //     ${productVariantFields}
  //   }
  // }
  // `,
  categories: `
    {
      categories {
        id
        slug
        name
        image
        description
        visible
        products {
          id
        }
        children {
          id
        }
      }
    }
    `,
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
