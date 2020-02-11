#!/usr/bin/env node
require("dotenv").config()
const startsWith = require("lodash/startsWith")

const { syncAll } = require("../dist/airtable/syncAll")
const {
  syncBrands,
  syncCategories,
  syncColors,
  syncLocations,
  syncProducts,
  syncProductVariants,
  syncCollections,
  syncCollectionGroups,
  syncHomepageProductRails,
  syncPhysicalProducts,
} = require("../dist/airtable")

require("yargs")
  .scriptName("monsoon")
  .usage("$0 <cmd> [args]")
  .command(
    "sync-db [table]",
    "sync airtable data to prisma",
    yargs => {
      yargs.positional("table", {
        type: "string",
        describe:
          "Name of the airtable base to sync (e.g. products, product-variants, categories)",
      })
    },
    async argv => {
      debugger
      console.log("Starting to sync", argv.table, "...")
      switch (argv.table) {
        case "all":
          return await syncAll()
        case "brands":
          return await syncBrands()
        case "categories":
          return await syncCategories()
        case "products":
          return await syncProducts()
        case "product-variants":
          await syncProducts()
          return await syncProductVariants()
        case "collections":
          return await syncCollections()
        case "collection-groups":
          return await syncCollectionGroups()
        case "homepage-product-rails":
          return await syncHomepageProductRails()
      }
    }
  )
  .completion("completion", (current, argv) => {
    if (current == "sync-db") {
      const options = [
        "all",
        "brands",
        "categories",
        "colors",
        "products",
        "product-variants",
        "physical-products",
      ]

      return options.filter(a => startsWith(a, argv.table))
    }
    return []
  })
  .help().argv
