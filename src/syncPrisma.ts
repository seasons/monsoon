import readlineSync from "readline-sync"
import { execSync } from "child_process"
import fs from "fs"
import { prisma } from "./prisma"
import { getAuth0Users } from "./auth/getAuth0Users"

export type prismaSyncDestination = "local" | "staging"
export const syncPrisma = async (env: prismaSyncDestination) => {
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

  if (
    readlineSync.keyInYN(getWarning({ toHost, toDBName, toPort, toUsername }))
  ) {
    // Y key was pressed
    runSync(toHost, toPort, toUsername, toDBName, toSchema)
  } else {
    // Another key was pressed.
    console.log(`\n** Exited without syncing prisma **`)
  }
}

const runSync = (toHost, toPort, toUsername, toDBName, toSchema) => {
  // .pgpass specifies passwords for the databases
  fs.chmodSync("/tmp/.pgpass", 0o600)

  const execSyncWithOptions = getExecSyncWithOptions({
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

const resetAuth0IDsForUsers = async (dbEnv: Exclude<dbEnv, "production">) => {
  /* 
    For user in users table:
        if there's a user with that email on Auth0
        change the user's Auth0ID appropriately.
    */
  //   const prismaUsers = await prisma.users()
  console.log("yo")
  const auth0Users = await getAuth0Users(
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlJVSTFPVVl4TURGQlFqYzNSVE5FTURBME1VTXlOa015UkRGRk5rTkJOelJCT1RoR04wSXlOUSJ9.eyJpc3MiOiJodHRwczovL3NlYXNvbnMtc3RhZ2luZy5hdXRoMC5jb20vIiwic3ViIjoiMHUxRk5tVXVTVzVoY2s1VnRQeXZZTENzUTZOcktKMWxAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vc2Vhc29ucy1zdGFnaW5nLmF1dGgwLmNvbS9hcGkvdjIvIiwiaWF0IjoxNTgyMzIyMTU4LCJleHAiOjE1ODI0MDg1NTgsImF6cCI6IjB1MUZObVV1U1c1aGNrNVZ0UHl2WUxDc1E2TnJLSjFsIiwic2NvcGUiOiJyZWFkOmNsaWVudF9ncmFudHMgY3JlYXRlOmNsaWVudF9ncmFudHMgZGVsZXRlOmNsaWVudF9ncmFudHMgdXBkYXRlOmNsaWVudF9ncmFudHMgcmVhZDp1c2VycyB1cGRhdGU6dXNlcnMgZGVsZXRlOnVzZXJzIGNyZWF0ZTp1c2VycyByZWFkOnVzZXJzX2FwcF9tZXRhZGF0YSB1cGRhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGRlbGV0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgY3JlYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBjcmVhdGU6dXNlcl90aWNrZXRzIHJlYWQ6Y2xpZW50cyB1cGRhdGU6Y2xpZW50cyBkZWxldGU6Y2xpZW50cyBjcmVhdGU6Y2xpZW50cyByZWFkOmNsaWVudF9rZXlzIHVwZGF0ZTpjbGllbnRfa2V5cyBkZWxldGU6Y2xpZW50X2tleXMgY3JlYXRlOmNsaWVudF9rZXlzIHJlYWQ6Y29ubmVjdGlvbnMgdXBkYXRlOmNvbm5lY3Rpb25zIGRlbGV0ZTpjb25uZWN0aW9ucyBjcmVhdGU6Y29ubmVjdGlvbnMgcmVhZDpyZXNvdXJjZV9zZXJ2ZXJzIHVwZGF0ZTpyZXNvdXJjZV9zZXJ2ZXJzIGRlbGV0ZTpyZXNvdXJjZV9zZXJ2ZXJzIGNyZWF0ZTpyZXNvdXJjZV9zZXJ2ZXJzIHJlYWQ6ZGV2aWNlX2NyZWRlbnRpYWxzIHVwZGF0ZTpkZXZpY2VfY3JlZGVudGlhbHMgZGVsZXRlOmRldmljZV9jcmVkZW50aWFscyBjcmVhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIHJlYWQ6cnVsZXMgdXBkYXRlOnJ1bGVzIGRlbGV0ZTpydWxlcyBjcmVhdGU6cnVsZXMgcmVhZDpydWxlc19jb25maWdzIHVwZGF0ZTpydWxlc19jb25maWdzIGRlbGV0ZTpydWxlc19jb25maWdzIHJlYWQ6aG9va3MgdXBkYXRlOmhvb2tzIGRlbGV0ZTpob29rcyBjcmVhdGU6aG9va3MgcmVhZDplbWFpbF9wcm92aWRlciB1cGRhdGU6ZW1haWxfcHJvdmlkZXIgZGVsZXRlOmVtYWlsX3Byb3ZpZGVyIGNyZWF0ZTplbWFpbF9wcm92aWRlciBibGFja2xpc3Q6dG9rZW5zIHJlYWQ6c3RhdHMgcmVhZDp0ZW5hbnRfc2V0dGluZ3MgdXBkYXRlOnRlbmFudF9zZXR0aW5ncyByZWFkOmxvZ3MgcmVhZDpzaGllbGRzIGNyZWF0ZTpzaGllbGRzIGRlbGV0ZTpzaGllbGRzIHJlYWQ6YW5vbWFseV9ibG9ja3MgZGVsZXRlOmFub21hbHlfYmxvY2tzIHVwZGF0ZTp0cmlnZ2VycyByZWFkOnRyaWdnZXJzIHJlYWQ6Z3JhbnRzIGRlbGV0ZTpncmFudHMgcmVhZDpndWFyZGlhbl9mYWN0b3JzIHVwZGF0ZTpndWFyZGlhbl9mYWN0b3JzIHJlYWQ6Z3VhcmRpYW5fZW5yb2xsbWVudHMgZGVsZXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRzIGNyZWF0ZTpndWFyZGlhbl9lbnJvbGxtZW50X3RpY2tldHMgcmVhZDp1c2VyX2lkcF90b2tlbnMgY3JlYXRlOnBhc3N3b3Jkc19jaGVja2luZ19qb2IgZGVsZXRlOnBhc3N3b3Jkc19jaGVja2luZ19qb2IgcmVhZDpjdXN0b21fZG9tYWlucyBkZWxldGU6Y3VzdG9tX2RvbWFpbnMgY3JlYXRlOmN1c3RvbV9kb21haW5zIHJlYWQ6ZW1haWxfdGVtcGxhdGVzIGNyZWF0ZTplbWFpbF90ZW1wbGF0ZXMgdXBkYXRlOmVtYWlsX3RlbXBsYXRlcyByZWFkOm1mYV9wb2xpY2llcyB1cGRhdGU6bWZhX3BvbGljaWVzIHJlYWQ6cm9sZXMgY3JlYXRlOnJvbGVzIGRlbGV0ZTpyb2xlcyB1cGRhdGU6cm9sZXMgcmVhZDpwcm9tcHRzIHVwZGF0ZTpwcm9tcHRzIHJlYWQ6YnJhbmRpbmcgdXBkYXRlOmJyYW5kaW5nIHJlYWQ6bG9nX3N0cmVhbXMgY3JlYXRlOmxvZ19zdHJlYW1zIGRlbGV0ZTpsb2dfc3RyZWFtcyB1cGRhdGU6bG9nX3N0cmVhbXMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.SamXheWL4wXeM0wwOzyJxhdEsZEn4WulIopMk0rLr1pL3HaMIK9_5EIagutS0hicHo_ESuSiswmOAfXh7uBSkzVPfX1hopXotY2N1aas8uVA_J7xVeCAIRl73Wqr2wIsySjn_VPt21mcb5H40l3erEa9X68lCLta7CiTmQoHE63XJ6FQKMX7BofNMDNQMYssiRrvFlkO5Lo8i7LTAIGIADZKjcxRlsawDzSzUHm-46hUpFd1ElUNsjVA08SS3tyqoOHtwUPcn9MYazLa6diSNDvCxr1vCqPVYcQbTCIyZWzZxn0iZV7dqpmivI53pjENZMiiysdd7SCX1Q9kCnCH4g"
  )
  console.log(auth0Users)
  //   for (const user of users) {
  //   }
}

resetAuth0IDsForUsers("local")
export type dbEnv = "staging" | "local" | "production"
export interface DBVars {
  host: string
  port: number
  dbname: string
  username: string
}

export const setDBEnvVarsFromJSON = (env: dbEnv, values: DBVars) => {
  process.env[`DB_${env.toUpperCase()}_HOST`] = values.host
  process.env[`DB_${env.toUpperCase()}_PORT`] = `${values.port}`
  process.env[`DB_${env.toUpperCase()}_USERNAME`] = values.username
  process.env[`DB_${env.toUpperCase()}_DBNAME`] = values.dbname
}

const getWarning = ({ toHost, toDBName, toPort, toUsername }) =>
  `
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

Proceed?`

const getExecSyncWithOptions = options => {
  return (cmd: string) => {
    execSync(cmd, options)
  }
}
