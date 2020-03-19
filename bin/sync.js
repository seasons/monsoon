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
        process.env.AIRTABLE_DATABASE_ID = env.airtable.production.baseID
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
    "sync:airtable:airtable <base>",
    "sync airtable production to secondary environment",
    yargs => {
      yargs.positional("base", {
        type: "string",
        describe: "human readable name of base to sync to",
        choices: ["staging1", "staging2"],
      })
    },
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
  .command(
    "create:test-user <email> <password>",
    "creates a test user with the given email and password",
    yargs => {
      yargs
        .positional("email", {
          type: "string",
          describe: "Email of the test user",
        })
        .positional("password", {
          type: "string",
          describe: "Password of the test user",
        })
        .options({
          e: {
            default: "local",
            describe: "Prisma environment on which to create the test user",
            choices: ["local", "staging"],
            type: "string",
          },
        })
    },
    async argv => {
      const Airtable = require("airtable")

      Airtable.configure({
        endpointUrl: "https://api.airtable.com",
        apiKey: process.env.AIRTABLE_KEY,
      })

      // TODO:  Set the environment
      const envFilePath = await downloadFromS3(
        "/tmp/__monsoon__env.json",
        "monsoon-scripts",
        "env.json"
      )
      try {
        const environment = argv.e // defaults to local
        const env = readJSONObjectFromFile(envFilePath)
        const { endpoint, secret } = env.prisma[environment]
        process.env.PRISMA_ENDPOINT = endpoint
        process.env.PRISMA_SECRET = secret
        process.env.AIRTABLE_DATABASE_ID = env.airtable.staging.baseID
      } catch (err) {
        console.log(err)
      } finally {
        // delete the env file
        fs.unlinkSync(envFilePath)
      }

      const {
        AuthService,
      } = require("../dist/modules/User/services/auth.service")
      const { PrismaClientService } = require("../dist/prisma/client.service")
      const {
        AirtableService,
      } = require("../dist/modules/Airtable/services/airtable.service")
      const {
        AirtableBaseService,
      } = require("../dist/modules/Airtable/services/airtable.base.service")
      const {
        AirtableUtilsService,
      } = require("../dist/modules/Airtable/services/airtable.utils.service")
      const { PrismaService } = require("../dist/prisma/prisma.service")
      const { head } = require("lodash")

      // Instantiate services
      const airtableBaseService = new AirtableBaseService()
      const auth = new AuthService(
        new PrismaClientService(),
        new AirtableService(
          airtableBaseService,
          new AirtableUtilsService(airtableBaseService)
        )
      )
      const prisma = new PrismaService()

      // Fail gracefully if the user is already in the DB
      if (!!(await prisma.client.user({ email: argv.email }))) {
        return console.log("User already in DB")
      }

      const { user, tokenData } = await auth.signupUser({
        email: argv.email,
        password: argv.password,
        firstName: "Billy",
        lastName: "Bob",
        details: {
          phoneNumber: "111-111-1111",
          //   birthday:
          height: 62,
          weight: "152lb",
          bodyType: "Athletic",
          shippingAddress: {
            create: {
              slug: `billy-bob-test-${Date.now()}`,
              name: `billy bob`,
              address1: "138 Mulberry St",
              city: "New York",
              state: "NY",
              zipCode: "10013",
            },
          },
        },
      })

      // Set their status to Active
      const customer = head(
        await prisma.client.customers({
          where: { user: { id: user.id } },
        })
      )
      await prisma.client.updateCustomer({
        data: {
          plan: "Essential",
          billingInfo: {
            create: {
              brand: "Visa",
              name: "Billy Bob",
              last_digits: "1234",
              expiration_month: 04,
              expiration_year: 2022,
            },
          },
          status: "Active",
        },
        where: { id: customer.id },
      })

      console.log(`User with given email, password successfully created`)
      console.log(`Access token: ${tokenData.access_token}`)
    }
  )
  .help().argv
