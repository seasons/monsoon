import { request, GraphQLClient } from "graphql-request"
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

const productRequestFields = `
id
brand
description
images
name
price
priceCurrency
productID
reason
sku
url
user {
  id
}
`
const collectionFields = `
id
slug
images
title
subTitle
descriptionTop
descriptionBottom
products {
  id
}
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
  product: `
  {
    product(where: {id: "ck7yztt6j01mh07249657q5mm"}) {
      ${productFields}
    }
  }
  `,
  products: `
  {
    products(orderBy: id_ASC) {
      ${productFields}
    }
  }
  `,
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
  productFunctions: `
    {
      productFunctions {
        id
        name
      }
    }
    `,
  productRequests: `
    {
      productRequests {
        ${productRequestFields}
      }
    }    
    `,
  collection: `
    {
      collection(where: {id: "ck7z0hmtd1a0s0724cd1wcew3"}) {
        ${collectionFields}
      }
    }
    `,
  collections: `
    {
      collections {
        ${collectionFields}
      }
    }
    `,
  faq: `
  {
    faq {
      sections {
        title
        subsections {
          title
          text
        }
      }
    }
  }
  `,
  me: `
  {
    me {
      user {
        id
        auth0Id
      }
      customer {
        id
        status 
        detail {
          id
          birthday
        }
        reservations {
          id
          products {
            seasonsUID
          }
          status
        }
      }
      activeReservation {
        id
        products {
          seasonsUID
        }
      }
      bag {
        id
        status
      }
      savedItems {
        id
        status
        productVariant {
          sku
        }
      }
    }
  }       
  `,
  productsConnection: `
  {
    productsConnection(sizes: ["M"], category: "shirts") {
      edges {
        node {
          id
        }
      }
      aggregate {
        count
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  `,
}
const oURL = "https://monsoon-staging.herokuapp.com"
const nURL = "https://monsoon-nest-staging.herokuapp.com"

// faiyam+g@seasons.nyc, Password10
const token =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJVSTFPVVl4TURGQlFqYzNSVE5FTURBME1VTXlOa015UkRGRk5rTkJOelJCT1RoR04wSXlOUSJ9.eyJpc3MiOiJodHRwczovL3NlYXNvbnMtc3RhZ2luZy5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NWU4NjQ3ZGY4NWRkOTgwYzY4ZDRjMDJkIiwiYXVkIjoiaHR0cHM6Ly9tb25zb29uLXN0YWdpbmcuaGVyb2t1YXBwLmNvbS8iLCJpYXQiOjE1ODU4NTg1MjcsImV4cCI6MTU4NTk0NDkyNywiYXpwIjoiZmNIUFF4N0tZcXBrcUkyeW4zMWZjTGd0N251VTJTNUQiLCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwiZ3R5IjoicGFzc3dvcmQifQ.N2YAKXI1IUdhcHYdu_vXCa4v0Xt3gnmp33k6nD-wMgNlCpo5oQnueFHbdT9Ntj-9pe_KH6I0WEJqDZp6vEubX2jhrjw3QH3imZiRZGwKsWjPx4DNUFJ8TOW7w0hT6C4n3gPtwTMoJORMQ4UKD0nclM8gGMSp39rpnolSqDPgpw6pqfpQ7UYF6PWyCHpEFkfooZiPNGHYStwPjB9wRCFf4RtPRNwEE1XJY9eFhLVLhi9wXbOIWWXJCAhQZEhE69IOjYfSKJrkQyitdE4i3QdbqyuLNJuQQ5OzFXwcJfXIbyD5e9FkUop6qhEOhAKTgN-O2FIhFkNneGLU9jVEWyMc-Q"

const run = async () => {
  let didError = false
  const headers = {
    Authorization: `Bearer ${token}`,
  }
  const oClient = new GraphQLClient(oURL, { headers })
  const nClient = new GraphQLClient(nURL, { headers })

  for (const key of Object.keys(queries)) {
    const oResult = await oClient.request(queries[key])
    const nResult = await nClient.request(queries[key])
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
