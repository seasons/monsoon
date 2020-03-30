#!/usr/bin/env ts-node

import { NestFactory } from "@nestjs/core"
import { CommandModule, CommandService } from "nestjs-command"
import * as Airtable from "airtable"
import dotenv from "dotenv"

dotenv.config()

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

// Must be imported after dotenv.configure() to ensure that env vars are being loaded before making module
import { ScriptsModule } from "../src/modules/Scripts/scripts.module"

async function setup() {
  const app = await NestFactory.createApplicationContext(ScriptsModule)

  app
    .select(CommandModule)
    .get(CommandService)
    .exec()
}

setup()
