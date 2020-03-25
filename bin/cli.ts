#!/usr/bin/env ts-node

import { NestFactory } from '@nestjs/core'
import { CommandModule, CommandService } from 'nestjs-command'
import { ScriptsModule } from '../src/modules/Scripts/scripts.module'
import * as Airtable from 'airtable'
import dotenv from 'dotenv'
 
dotenv.config()

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

async function setup() {
  const app = await NestFactory.createApplicationContext(ScriptsModule);
  app.select(CommandModule).get(CommandService).exec();
}

setup()
 