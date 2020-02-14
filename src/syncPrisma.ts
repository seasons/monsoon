import readline from "readline"
import { execSync } from "child_process"
import { allVariablesDefined } from "./utils"

export type prismaSyncDestination = "local" | "staging"
export const syncPrisma = (env: prismaSyncDestination) => {
  if (!checkDBEnvVars(env)) {
    return
  }
  let toHost
  let toDBName
  let toUsername
  let toPort
  let toSchema
  switch (env) {
    case "staging":
      toHost = process.env.DB_STAGING_HOST
      toDBName = process.env.DB_STAGING_DBNAME
      toUsername = process.env.DB_STAGING_USERNAME
      toPort = process.env.DB_STAGING_PORT
      toSchema = "monsoon$staging"
      break
    case "local":
      toHost = process.env.DB_LOCAL_HOST
      toDBName = process.env.DB_LOCAL_DBNAME
      toUsername = process.env.DB_LOCAL_USERNAME
      toPort = process.env.DB_LOCAL_PORT
      toSchema = "monsoon$dev"
      break
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.on("close", () => {
    process.exit(0)
  })
  rl.question(getWarning(toHost, toDBName), answer => {
    if (answer === "y") {
      runSync(toHost, toPort, toUsername, toDBName, toSchema)
    } else {
      console.log("Exited without syncing prisma")
    }
    rl.close()
  })
}

const runSync = (toHost, toPort, toUsername, toDBName, toSchema) => {
  // .pgpass specifies passwords for the databases
  execSync("export PGPASSFILE=$PWD/.pgpass", { stdio: "inherit" })

  // Copy monsoon$production schema and all contained tables as is to destination DB.
  try {
    execSync(
      `pg_dump --format=t --clean --create --no-password --host=${process.env.DB_PROD_HOST}\
 --port=${process.env.DB_PROD_PORT} --username=${process.env.DB_PROD_USERNAME} ${process.env.DB_PROD_DBNAME}\
 | pg_restore --host=${toHost} --port=${toPort} --username=${toUsername} --no-password\
 --dbname=${toDBName}`,
      { stdio: "inherit" }
    )
  } catch (err) {
    console.log(err)
  }

  //  Drop the (old) monsoon$staging or monsoon$dev schema and all contained tables
  execSync(
    `echo 'DROP SCHEMA "${toSchema}" CASCADE' | psql --host=${toHost}\
 --port=${toPort} --username=${toUsername} --no-password --dbname=${toDBName}`,
    { stdio: "inherit" }
  )

  // Adjust the name of the schema to be appropriate for staging or dev
  execSync(
    `echo 'ALTER SCHEMA "monsoon$production" RENAME TO "${toSchema}"' | psql --host=${toHost}\
 --port=${toPort} --username=${toUsername} --no-password --dbname=${toDBName}`,
    { stdio: "inherit" }
  )
}

export type dbEnv = "staging" | "local" | "production"
export const checkDBEnvVars = (env: dbEnv) => {
  switch (env) {
    case "production":
      if (
        !allVariablesDefined([
          process.env.DB_PROD_HOST,
          process.env.DB_PROD_PORT,
          process.env.DB_PROD_USERNAME,
          process.env.DB_PROD_DBNAME,
        ])
      ) {
        console.log(
          `Check your environment variables. DB_PROD_HOST, DB_PROD_PORT,` +
            `DB_PROD_USERNAME and DB_PROD_DBNAME must be set`
        )
        return false
      }
      break
    case "staging":
      if (
        !allVariablesDefined([
          process.env.DB_STAGING_HOST,
          process.env.DB_STAGING_PORT,
          process.env.DB_STAGING_USERNAME,
          process.env.DB_STAGING_DBNAME,
        ])
      ) {
        console.log(
          `Check your environment variables. DB_STAGING_HOST, DB_STAGING_PORT,` +
            `DB_STAGING_USERNAME and DB_STAGING_DBNAME must be set`
        )
        return false
      }
      break
    case "local":
      if (
        !allVariablesDefined([
          process.env.DB_LOCAL_HOST,
          process.env.DB_LOCAL_PORT,
          process.env.DB_LOCAL_USERNAME,
          process.env.DB_LOCAL_DBNAME,
        ])
      ) {
        console.log(
          `Check your environment variables. DB_LOCAL_HOST, DB_LOCAL_PORT,` +
            `DB_LOCAL_USERNAME and DB_LOCAL_DBNAME must be set`
        )
        return false
      }
      break
  }
  return true
}

const getWarning = (toHost, toDBName) =>
  `
** Note: Please ensure you are in monsoon's root directory, or this won't work **
    
For your convenience:

Prisma production URL: https://dashboard.heroku.com/apps/monsoon-prisma-production
Prisma staging URL: https://dashboard.heroku.com/apps/monsoon-prisma-staging

Prisma Production DB Credentials: https://data.heroku.com/datastores/678b494b-b22a-4623-b8be-cdd4af0b73aa#credentials
Prisma Staging DB Credentials: https://data.heroku.com/datastores/22766167-0a92-40df-9949-6c9733728e93#administration

DANGER ALERT. You are about to delete all data on the database at "${toHost}" with \
name "${toDBName}" and replace it with data from DB \
"${process.env.DB_PROD_DBNAME}" at host "${process.env.DB_PROD_HOST}"

Proceed? (y/n)\n`
