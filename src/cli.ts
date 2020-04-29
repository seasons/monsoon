// import-sort-ignore
import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import * as Airtable from "airtable"
import dotenv from "dotenv"
import { CommandModule, CommandService } from "nestjs-command"

import { ScriptsModule } from "./modules/Scripts/scripts.module"

// Must be imported after dotenv.configure() to ensure that env vars are being loaded before making module
// prettier-ignore
dotenv.config()

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

async function setup() {
  const app = await NestFactory.createApplicationContext(ScriptsModule)

  const commandService = app.select(CommandModule).get(CommandService)
  commandService.yargs.scriptName("monsoon")
  commandService.yargs.strict() // throw error if user passes in unrecognized command name or option
  commandService.exec()
}

setup()
