import { Command, Positional } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { ScriptsService } from '../services/scripts.service';
import fs from 'fs';
import readlineSync from 'readline-sync';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthService } from '../../User/services/auth.service';
import { execSync } from 'child_process';

type dbEnv = "staging" | "local" | "production"
interface DBVars {
  host: string
  port: number
  dbname: string
  username: string
  endpoint: string
  secret: string
}
type prismaSyncDestination = "local" | "staging"
 
@Injectable()
export class SyncCommands {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly scriptsService: ScriptsService
  ) {}

  @Command({
    command: 'sync:prisma:prisma <destination>',
    describe: 'sync prisma production to staging/local',
  })
  async syncPrisma(
    @Positional({
      name: "destination",
      type: "string",
      describe: "Prisma environment to sync to",
      choices: ["staging", "local"]
    }) destination
  ) {
    // const { syncPrisma, setDBEnvVarsFromJSON } = require("../dist/syncPrisma")
    const pgpassFilepath = await this.scriptsService.downloadFromS3(
      "/tmp/.pgpass",
      "monsoon-scripts",
      "pgpass.txt"
    )
    const envFilepath = await this.scriptsService.downloadFromS3(
      "/tmp/__monsoon__env.json",
      "monsoon-scripts",
      "env.json"
    )
    try {
      const env = this.scriptsService.readJSONObjectFromFile(envFilepath)
      this.setDBEnvVarsFromJSON("production", env.postgres.production)
      this.setDBEnvVarsFromJSON(destination, {
        ...env.postgres[destination],
        ...env.prisma[destination],
      })
      process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_ID =
        env.auth0.staging["monsoon(staging)"].clientID
      process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_SECRET =
        env.auth0.staging["monsoon(staging)"].clientSecret
      this.execSyncPrisma(destination)
    } catch (err) {
      console.log(err)
    } finally {
      fs.unlinkSync(pgpassFilepath)
      fs.unlinkSync(envFilepath)
    }
  }

  private async execSyncPrisma(env: prismaSyncDestination) {
    let toHost
    let toDBName
    let toUsername
    let toPort
    let toSchema
    let toEndpoint
    let toSecret
    switch (env) {
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
  
    if (
      readlineSync.keyInYN(this.getWarning({ toHost, toDBName, toPort, toUsername }))
    ) {
      // Y key was pressed
      this.runSync(toHost, toPort, toUsername, toDBName, toSchema)
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

  private getWarning({ toHost, toDBName, toPort, toUsername }) {
    return `
    For your convenience:

    Prisma production URL: https://dashboard.heroku.com/apps/monsoon-prisma-production
    Prisma staging URL: https://dashboard.heroku.com/apps/monsoon-prisma-staging

    Prisma Production DB Credentials: https://data.heroku.com/datastores/678b494b-b22a-4623-b8be-cdd4af0b73aa#credentials
    Prisma Staging DB Credentials: https://data.heroku.com/datastores/22766167-0a92-40df-9949-6c9733728e93#administration

    DANGER ALERT. Please review the change you are about to make.

    Source DB:
    -- Host: ${process.env.DB_PRODUCTION_HOST}
    -- Port: ${process.env.DB_PRODUCTION_PORT}
    -- DBname: ${process.env.DB_PRODUCTION_DBNAME}
    -- Username: ${process.env.DB_PRODUCTION_USERNAME}

    Destination DB:
    -- Host: ${toHost}
    -- Port: ${toPort}
    -- DBName: ${toDBName}
    -- Username: ${toUsername}

    All data on the destination DB will be irreversibly (unless you have a backup)
    replaced with the data from source.

    Proceed?
    `
  }

  private runSync(toHost, toPort, toUsername, toDBName, toSchema) {
    // .pgpass specifies passwords for the databases
    fs.chmodSync("/tmp/.pgpass", 0o600)
  
    const execSyncWithOptions = this.getExecSyncWithOptions({
      stdio: "inherit",
      env: { ...process.env, PGPASSFILE: "/tmp/.pgpass" },
    })
  
    // Copy monsoon$production schema and all contained tables as is to destination DB.
    // We are ok with this throwing a few errors.
    try {
      execSyncWithOptions(
        `pg_dump --format=t --clean --create --no-password --host=${process.env.DB_PRODUCTION_HOST}\
   --port=${process.env.DB_PRODUCTION_PORT} --username=${process.env.DB_PRODUCTION_USERNAME}\
   ${process.env.DB_PRODUCTION_DBNAME} | pg_restore --host=${toHost} --port=${toPort}\
   --username=${toUsername} --no-password --dbname=${toDBName}`
      )
    } catch (err) {
      console.log(err)
    }
  
    //  Drop the (old) monsoon$staging or monsoon$dev schema and all contained tables
    execSyncWithOptions(
      `echo 'DROP SCHEMA "${toSchema}" CASCADE' | psql --host=${toHost}\
   --port=${toPort} --username=${toUsername} --no-password --dbname=${toDBName}`
    )
  
    // Adjust the name of the schema to be appropriate for staging or dev
    execSyncWithOptions(
      `echo 'ALTER SCHEMA "monsoon$production" RENAME TO "${toSchema}"' | psql --host=${toHost}\
   --port=${toPort} --username=${toUsername} --no-password --dbname=${toDBName}`
    )
  }
  
  private async resetAuth0IDsForUsers({
    endpoint,
    secret,
  }: {
    endpoint: string
    secret: string
  }) {
    const prismaUsers = await this.prisma.binding.query.users(
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
        await this.prisma.binding.mutation.updateUser({
          where: { id: prismaUser.id },
          data: { auth0Id: correspondingAuth0User.user_id.split("|")[1] },
        })
      }
    }
  }

  private setDBEnvVarsFromJSON(env: dbEnv, values: DBVars) {
    process.env[`DB_${env.toUpperCase()}_HOST`] = values.host
    process.env[`DB_${env.toUpperCase()}_PORT`] = `${values.port}`
    process.env[`DB_${env.toUpperCase()}_USERNAME`] = values.username
    process.env[`DB_${env.toUpperCase()}_DBNAME`] = values.dbname
    process.env[`DB_${env.toUpperCase()}_ENDPOINT`] = values.endpoint
    process.env[`DB_${env.toUpperCase()}_SECRET`] = values.secret
  }

}