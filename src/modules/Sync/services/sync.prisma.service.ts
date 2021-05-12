import { execSync } from "child_process"
import fs from "fs"

import { AuthService } from "@modules/User/services/auth.service"
import { Injectable } from "@nestjs/common"
import { Prisma } from "@prisma1/prisma.binding"
import readlineSync from "readline-sync"

type dbEnv = "staging" | "local" | "production"
interface DBVars {
  host: string
  port: number
  dbname: string
  username: string
  endpoint: string
  secret: string
}
type PrismaSyncDestination = "local" | "staging"
type PrismaSyncOrigin = "staging" | "production"

@Injectable()
export class PrismaSyncService {
  constructor(private readonly authService: AuthService) {}

  setDBEnvVarsFromJSON(env: dbEnv, values: DBVars) {
    process.env[`DB_${env.toUpperCase()}_HOST`] = values.host
    process.env[`DB_${env.toUpperCase()}_PORT`] = `${values.port}`
    process.env[`DB_${env.toUpperCase()}_USERNAME`] = values.username
    process.env[`DB_${env.toUpperCase()}_DBNAME`] = values.dbname
    process.env[`DB_${env.toUpperCase()}_ENDPOINT`] = values.endpoint
    process.env[`DB_${env.toUpperCase()}_SECRET`] = values.secret
  }

  async syncPrisma(
    destination: PrismaSyncDestination,
    origin: PrismaSyncOrigin
  ) {
    let toHost
    let toDBName
    let toUsername
    let toPort
    let toSchema
    let toEndpoint
    let toSecret
    switch (destination) {
      case "staging":
        toHost = process.env.DB_STAGING_HOST
        toDBName = process.env.DB_STAGING_DBNAME
        toUsername = process.env.DB_STAGING_USERNAME
        toPort = process.env.DB_STAGING_PORT
        toEndpoint = process.env.DB_STAGING_ENDPOINT
        toSecret = process.env.DB_STAGING_SECRET
        toSchema = "monsoon$staging"
        break
      case "local":
        toHost = process.env.DB_LOCAL_HOST
        toDBName = process.env.DB_LOCAL_DBNAME
        toUsername = process.env.DB_LOCAL_USERNAME
        toPort = process.env.DB_LOCAL_PORT
        toEndpoint = process.env.DB_LOCAL_ENDPOINT
        toSecret = process.env.DB_LOCAL_SECRET
        toSchema = "monsoon$dev"
        break
    }

    let fromHost
    let fromPort
    let fromUsername
    let fromDBName
    let fromSchema
    switch (origin) {
      case "staging":
        fromHost = process.env.DB_STAGING_HOST
        fromDBName = process.env.DB_STAGING_DBNAME
        fromUsername = process.env.DB_STAGING_USERNAME
        fromPort = process.env.DB_STAGING_PORT
        fromSchema = "monsoon$staging"
        break
      case "production":
        fromHost = process.env.DB_PRODUCTION_HOST
        fromPort = process.env.DB_PRODUCTION_PORT
        fromUsername = process.env.DB_PRODUCTION_USERNAME
        fromDBName = process.env.DB_PRODUCTION_DBNAME
        fromSchema = "monsoon$production"
        break
    }

    if (readlineSync.keyInYN(this.getWarning(destination, origin))) {
      // Y key was pressed
      this.runSync(
        { fromHost, fromPort, fromUsername, fromDBName, fromSchema },
        {
          toHost,
          toPort,
          toUsername,
          toDBName,
          toSchema,
        }
      )
      this.resetAuth0IDsForUsers({
        endpoint: toEndpoint,
        secret: toSecret,
      })
    } else {
      // Another key was pressed.
      console.log(`\n** Exited without syncing prisma **`)
    }
  }

  private getExecSyncWithOptions(options) {
    return (cmd: string) => {
      execSync(cmd, options)
    }
  }

  private getWarning(destination, origin) {
    return `
    DANGER ALERT. Please review the change you are about to make.

    You are syncing from ${origin} to ${destination}.

    All data on the destination will be irreversibly replaced with the data from source.

    DOUBLE DANGER: If the schema on the target DB does not match the schema on the origin db, 
    this will irrevocably damage your target DB. You will then need to recreate it from scratch. 

    Please ensure before proceeding that your target DB's schema matches the origin's.
    You can do so as follows:
    1. Get the latest commit to deployed to the origin service. (If production, run monsoon gpc)
    2. Checkout that commit and deploy prisma to your target DB. 
    3. Re-run this sync. 

    After step 3, you free to switch branches as you desire. 
    `
  }

  private runSync(
    { fromHost, fromPort, fromUsername, fromDBName, fromSchema },
    { toHost, toPort, toUsername, toDBName, toSchema }
  ) {
    // .pgpass specifies passwords for the databases
    fs.chmodSync("/tmp/.pgpass", 0o600)

    const execSyncWithOptions = this.getExecSyncWithOptions({
      stdio: "inherit",
      env: { ...process.env, PGPASSFILE: "/tmp/.pgpass" },
    })

    const destinationCreds = `--host=${toHost} --port=${toPort} --username=${toUsername} --no-password --dbname=${toDBName}`
    // Copy monsoon$production schema and all contained tables as is to destination DB.
    // We are ok with this throwing a few errors.
    try {
      console.log(
        `Copying all objects from schema ${fromSchema} to ${toSchema}...`
      )

      execSyncWithOptions(
        `pg_dump --format=t --schema='${fromSchema}' --clean --create --no-password --host=${fromHost}\
   --port=${fromPort} --username=${fromUsername} ${fromDBName} | pg_restore ${destinationCreds}`
      )
    } catch (err) {
      console.log(err)
    }

    //  Drop the (old) monsoon$staging or monsoon$dev schema and all contained tables
    execSyncWithOptions(
      `echo 'DROP SCHEMA "${toSchema}" CASCADE' | psql ${destinationCreds}`
    )

    // Adjust the name of the schema to be appropriate for staging or dev
    execSyncWithOptions(
      `echo 'ALTER SCHEMA "${fromSchema}" RENAME TO "${toSchema}"' | psql ${destinationCreds}`
    )

    // Drop the audit trigger from the inherited schema. Should technically also recreate it, but
    // we can pick that up another day
    execSyncWithOptions(
      `echo 'DROP FUNCTION ${toSchema}.if_modified_func() CASCADE' | psql ${destinationCreds}`
    )
  }

  private async resetAuth0IDsForUsers({
    endpoint,
    secret,
  }: {
    endpoint: string
    secret: string
  }) {
    const db = new Prisma({
      endpoint,
      secret,
    })
    const prismaUsers = await db.query.users(
      {},
      `{
          id
          email
      }`
    )
    const auth0Users = await this.authService.getAuth0Users()
    for (const prismaUser of prismaUsers) {
      const correspondingAuth0User = auth0Users.find(
        a => a.email === prismaUser.email
      )
      if (!!correspondingAuth0User) {
        console.log(
          `User w/Email: ${prismaUser.email} auth0ID synced with staging`
        )
        await db.mutation.updateUser({
          where: { id: prismaUser.id },
          data: { auth0Id: correspondingAuth0User.user_id.split("|")[1] },
        })
      }
    }
  }
}
