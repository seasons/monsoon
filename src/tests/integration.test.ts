import express from "express" // import express so we can create a mock server
import { graphqlHTTP } from "express-graphql" // import graphqlHTTP express library
import { importSchema } from "graphql-import"
import { makeExecutableSchema } from "graphql-tools"
import request from "supertest" // import request library from supertest

const typeDefs = importSchema("src/schema.graphql")

const schema = makeExecutableSchema({
  typeDefs: typeDefs,
})

// we create describe functions similar to RSpec
describe("user queries", async () => {
  let server = express()

  beforeAll(() => {
    server.use(
      "/",
      graphqlHTTP({
        schema,
        graphiql: false,
      })
    )
  })

  test("fetch users", async done => {
    request(server)
      .post("/graphql")
      .send({
        operationName: "ProductEditQuery",
        query:
          'query ProductEditQuery($input: ProductWhereUniqueInput!, $productType: ProductType) {\n  categories(where: {AND: [{children_every: {id: null}}, {productType: $productType}]}, orderBy: name_ASC) {\n    id\n    name\n    __typename\n  }\n  ...ProductUpsert\n  product(where: $input) {\n    id\n    ...ProductFragment\n    brand {\n      id\n      styles\n      __typename\n    }\n    styles\n    __typename\n  }\n}\n\nfragment ProductUpsert on Query {\n  brands(orderBy: name_ASC) {\n    id\n    brandCode\n    name\n    slug\n    __typename\n  }\n  inventoryStatuses: __type(name: "InventoryStatus") {\n    enumValues {\n      name\n      __typename\n    }\n    __typename\n  }\n  physicalProductStatuses: __type(name: "PhysicalProductStatus") {\n    enumValues {\n      name\n      __typename\n    }\n    __typename\n  }\n  productArchitectures: __type(name: "ProductArchitecture") {\n    enumValues {\n      name\n      __typename\n    }\n    __typename\n  }\n  productMaterialCategories {\n    id\n    slug\n    __typename\n  }\n  productModels {\n    id\n    name\n    __typename\n  }\n  productTypes: __type(name: "ProductType") {\n    enumValues {\n      name\n      __typename\n    }\n    __typename\n  }\n  tags {\n    name\n    __typename\n  }\n}\n\nfragment ProductFragment on Product {\n  ...product\n  publishedAt\n  externalURL\n  architecture\n  photographyStatus\n  innerMaterials\n  outerMaterials\n  status\n  type\n  productFit\n  buyNewEnabled\n  buyUsedEnabled\n  buyUsedPrice\n  season {\n    id\n    internalSeason {\n      id\n      year\n      seasonCode\n      __typename\n    }\n    vendorSeason {\n      id\n      year\n      seasonCode\n      __typename\n    }\n    wearableSeasons\n    __typename\n  }\n  tier {\n    id\n    tier\n    price\n    __typename\n  }\n  color {\n    id\n    colorCode\n    name\n    __typename\n  }\n  functions {\n    id\n    name\n    __typename\n  }\n  materialCategory {\n    id\n    slug\n    __typename\n  }\n  model {\n    id\n    name\n    __typename\n  }\n  modelSize {\n    id\n    display\n    __typename\n  }\n  secondaryColor {\n    id\n    colorCode\n    name\n    __typename\n  }\n  tags {\n    id\n    name\n    __typename\n  }\n  variants {\n    id\n    sku\n    manufacturerSizes {\n      id\n      type\n      productType\n      __typename\n    }\n    internalSize {\n      id\n      display\n      productType\n      __typename\n    }\n    product {\n      id\n      __typename\n    }\n    physicalProducts {\n      id\n      seasonsUID\n      productStatus\n      inventoryStatus\n      offloadMethod\n      offloadNotes\n      warehouseLocation {\n        id\n        barcode\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment product on Product {\n  id\n  slug\n  name\n  description\n  photographyStatus\n  productFit\n  createdAt\n  updatedAt\n  publishedAt\n  retailPrice\n  type\n  images(size: Small, options: {retina: true}) {\n    url\n    __typename\n  }\n  brand {\n    id\n    name\n    __typename\n  }\n  category {\n    id\n    name\n    __typename\n  }\n  __typename\n}\n',
        variables: {
          input: {
            id: "ckpog36nf44kj0797ef7dmf6w",
          },
          productType: "Top",
        },
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        expect(res.body).toBeInstanceOf(Object)
        expect(res.body.data).toBeInstanceOf(Object)
        expect(res.body.data.categories.length).toBeGreaterThan(0)
        expect(res.body.data.brands.length).toBeGreaterThan(0)
        done()
      })
  })

  test("two plus two is four", () => {
    expect(2 + 2).toBe(4)
  })
})
