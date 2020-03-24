#!/usr/bin/env node
require("dotenv").config()

const fs = require("fs")

const { downloadFromS3 } = require("../dist/downloadFromS3")
const { readJSONObjectFromFile } = require("../dist/utils")

require("yargs")
  .scriptName("monsoon")
  .usage("$0 <cmd> <table> -e [environment]")
  .command(
    "sync:airtable:prisma <table>",
    "sync airtable data to prisma",
    yargs => {
      yargs
        .positional("table", {
          type: "string",
          describe: "Name of the airtable base to sync",
          choices: [
            "all",
            "brands",
            "categories",
            "products",
            "product-variants",
            "collections",
            "collection-groups",
            "homepage-product-rails",
          ],
        })
        .options({
          e: {
            default: "staging",
            describe: "Prisma environment to sync to",
            choices: ["local", "staging", "production"],
            type: "string",
          },
        })
    },
    async argv => {
      const envFilePath = await downloadFromS3(
        "/tmp/__monsoon__env.json",
        "monsoon-scripts",
        "env.json"
      )
      try {
        const environment = argv.e || "staging"
        const env = readJSONObjectFromFile(envFilePath)
        const { endpoint, secret } = env.prisma[environment]
        process.env.PRISMA_ENDPOINT = endpoint
        process.env.PRISMA_SECRET = secret
        process.env.AIRTABLE_DATABASE_ID = env.airtable[environment].baseID
      } catch (err) {
        console.log(err)
      } finally {
        // delete the env file
        fs.unlinkSync(envFilePath)
      }

      const {
        syncBrands,
        syncCategories,
        syncProducts,
        syncProductVariants,
        syncCollections,
        syncCollectionGroups,
        syncHomepageProductRails,
      } = require("../dist/airtable/prismaSync")
      const { syncAll } = require("../dist/airtable/prismaSync/syncAll")
      readlineSync = require("readline-sync")

      const shouldProceed = readlineSync.keyInYN(
        `You are about sync ${
          argv.table === "all" ? "all the tables" : "the " + argv.table
        } from airtable with baseID ${
          process.env.AIRTABLE_DATABASE_ID
        } to prisma at url ${process.env.PRISMA_ENDPOINT}\n. Proceed? (y/n)`
      )
      if (!shouldProceed) {
        console.log("\nExited without running anything\n")
        return
      }

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
        default:
          throw new Error("invalid table name")
      }
    }
  )
  .command(
    "sync:prisma:prisma <destination>",
    "sync prisma production to staging/local",
    yargs => {
      yargs.positional("destination", {
        type: "string",
        describe: "Prisma environment to sync to",
        choices: ["staging", "local"],
      })
    },
    async argv => {
      const { syncPrisma, setDBEnvVarsFromJSON } = require("../dist/syncPrisma")

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
        setDBEnvVarsFromJSON(argv.destination, {
          ...env.postgres[argv.destination],
          ...env.prisma[argv.destination],
        })
        process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_ID =
          env.auth0.staging["monsoon(staging)"].clientID
        process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_SECRET =
          env.auth0.staging["monsoon(staging)"].clientSecret
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
    "sync:airtable:airtable",
    "sync airtable production to staging",
    async argv => {
      const {
        syncAll: syncAllAirtableToAirtable,
      } = require("../dist/airtable/environmentSync/syncAll")

      const envFilePath = await downloadFromS3(
        "/tmp/__monsoon__env.json",
        "monsoon-scripts",
        "env.json"
      )
      try {
        const env = readJSONObjectFromFile(envFilePath)
        process.env._PRODUCTION_AIRTABLE_BASEID =
          env.airtable["production"].baseID
        process.env._STAGING_AIRTABLE_BASEID = env.airtable["staging"].baseID
        await syncAllAirtableToAirtable()
      } catch (err) {
        console.log(err)
      } finally {
        // delete the env file
        fs.unlinkSync(envFilePath)
      }
    }
  )
  .help().argv
