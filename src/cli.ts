// import-sort-ignore
import "module-alias/register"

import * as Airtable from "airtable"

import { CommandModule, CommandService } from "nestjs-command"

import { NestFactory } from "@nestjs/core"
import dotenv from "dotenv"

dotenv.config()
// Must be imported after dotenv.configure() to ensure that env vars are being loaded before making module
import { ScriptsModule } from "./modules/Scripts/scripts.module"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

async function setup() {
  const app = await NestFactory.createApplicationContext(ScriptsModule)

  const commandService = app.select(CommandModule).get(CommandService)
  commandService.yargs.scriptName("monsoon")
  commandService.exec()
}

setup()
