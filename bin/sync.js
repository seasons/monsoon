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
          prisma: {
            alias: "pe",
            default: "staging",
            describe: "Prisma environment to sync to",
            choices: ["local", "staging", "production"],
            type: "string",
          },
          airtable: {
            alias: "ae",
            default: "staging",
            describe: "Airtable base to sync from",
            choices: ["production", "staging"],
            type: "string",
          },
        })
    },
    async argv => {
      console.log(process.env.PRISMA_SECRET)
      await overrideEnvFromRemoteConfig({
        prismaEnvironment: argv.pe,
        airtableEnvironment: argv.ae,
      })

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
    yargs => {},
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
  .command(
    "create:test-user",
    "creates a test user with the given email and password",
    yargs => {
      yargs.options({
        e: {
          default: "local",
          describe: "Prisma environment on which to create the test user",
          choices: ["local", "staging"],
          type: "string",
        },
        email: {
          type: "string",
          describe: "Email of the test user",
        },
        password: {
          type: "string",
          describe: "Password of the test user",
        },
      })
    },
    async argv => {
      const Airtable = require("airtable")

      Airtable.configure({
        endpointUrl: "https://api.airtable.com",
        apiKey: process.env.AIRTABLE_KEY,
      })

      await overrideEnvFromRemoteConfig({ prismaEnvironment: argv.e })

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
      const faker = require("faker")

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

      const firstName = faker.name.firstName()
      const lastName = faker.name.lastName()
      const fullName = `${firstName} ${lastName}`
      const slug = `${firstName}-${lastName}`.toLowerCase()
      const email = argv.email || `${slug}@seasons.nyc`
      const password = argv.password || faker.random.alphaNumeric(6)

      // Fail gracefully if the user is already in the DB
      if (!!(await prisma.client.user({ email }))) {
        return console.log("User already in DB")
      }

      const { user, tokenData } = await auth.signupUser({
        email,
        password,
        firstName,
        lastName,
        details: {
          phoneNumber: faker.phone.phoneNumber(),
          height: 40 + faker.random.number(32),
          weight: "152lb",
          bodyType: "Athletic",
          shippingAddress: {
            create: {
              slug,
              name: `${firstName} ${lastName}`,
              address1: faker.address.streetAddress(),
              city: faker.address.city(),
              state: faker.address.state(),
              zipCode: faker.address.zipCode(),
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
              name: fullName,
              last_digits: faker.finance.mask(4),
              expiration_month: 04,
              expiration_year: 2022,
            },
          },
          status: "Active",
        },
        where: { id: customer.id },
      })

      console.log(
        `User with email: ${email}, password: ${password} successfully created`
      )
      console.log(`Access token: ${tokenData.access_token}`)
    }
  )
  .help().argv

async function overrideEnvFromRemoteConfig({
  prismaEnvironment = "local",
  airtableEnvironment = "staging",
}) {
  const envFilePath = await downloadFromS3(
    "/tmp/__monsoon__env.json",
    "monsoon-scripts",
    "env.json"
  )
  try {
    const env = readJSONObjectFromFile(envFilePath)
    const { endpoint, secret } = env.prisma[prismaEnvironment]
    process.env.PRISMA_ENDPOINT = endpoint
    process.env.PRISMA_SECRET = secret
    process.env.AIRTABLE_DATABASE_ID = env.airtable[airtableEnvironment].baseID
  } catch (err) {
    console.log(err)
  } finally {
    // delete the env file
    fs.unlinkSync(envFilePath)
  }
}
