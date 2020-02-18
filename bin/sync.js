#!/usr/bin/env node
require("dotenv").config()

const startsWith = require("lodash/startsWith")
const fs = require("fs")

const { syncAll } = require("../dist/airtable/prismaSync/syncAll")
const {
  syncAll: syncAllAirtableToAirtable,
} = require("../dist/airtable/environmentSync/syncAll")
const { syncPrisma, setDBEnvVarsFromJSON } = require("../dist/syncPrisma")
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
} = require("../dist/airtable/prismaSync")
const { downloadFromS3 } = require("../dist/downloadFromS3")
const { readJSONObjectFromFile } = require("../dist/utils")

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
  .command(
    "sync-prisma [destination]",
    "sync prisma production to staging/local",
    yargs => {
      yargs.positional("destination", {
        type: "string",
        describe: "Prisma environment to sync to: staging | local",
      })
    },
    async argv => {
      if (!["staging", "local"].includes(argv.destination)) {
        console.log("Destination must be one of local, staging")
        return
      }
      const pgpassFilepath = await downloadFromS3(
        "/tmp/.pgpass",
        "monsoon-scripts",
        "pgpass.txt"
      )
      const envFilepath = await downloadFromS3(
        "/tmp/__monsoon__env.json",
        "monsoon-scripts",
        "env.json"
      )
      try {
        const env = readJSONObjectFromFile(envFilepath)
        setDBEnvVarsFromJSON("production", env.postgres.production)
        setDBEnvVarsFromJSON(argv.destination, env.postgres[argv.destination])
        syncPrisma(argv.destination)
      } catch (err) {
        console.log(err)
      } finally {
        fs.unlinkSync(pgpassFilepath)
        fs.unlinkSync(envFilepath)
      }
    }
  )
  .command(
    "sync-airtable [base]",
    "syncs airtable production environment to given secondary environment",
    yargs => {
      yargs.positional("base", {
        type: "string",
        describe:
          "human readable name of base to sync to. Options are staging1 | staging2",
      })
    },
    async argv => {
      const envFilePath = await downloadFromS3(
        "/tmp/__monsoon__env.json",
        "monsoon-scripts",
        "env.json"
      )
      try {
        const env = readJSONObjectFromFile(envFilePath)
        if (!(env.airtable[argv.base] && env.airtable[argv.base].baseID)) {
          throw new Error("invalid base. valid options are staging1 | staging2")
        }
        if (argv.base === "production") {
          throw new Error(
            "can not sync to production. valid options are staging1 | staging2"
          )
        }
        process.env._PRODUCTION_AIRTABLE_BASEID =
          env.airtable["production"].baseID
        process.env._STAGING_AIRTABLE_BASEID = env.airtable[argv.base].baseID
        await syncAllAirtableToAirtable()
      } catch (err) {
        console.log(err)
      } finally {
        // delete the env file
        fs.unlinkSync(envFilePath)
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
