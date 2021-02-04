// import-sort-ignore
import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import dotenv from "dotenv"
import { CommandModule, CommandService } from "nestjs-command"

dotenv.config()

// Must be imported after dotenv.configure() to ensure that env vars are loaded before making module
import { ScriptsModule } from "./modules/Scripts/scripts.module"

async function setup() {
  const app = await NestFactory.createApplicationContext(ScriptsModule, {
    logger: false
  })

  const commandService = app.select(CommandModule).get(CommandService)
  commandService.yargs.scriptName("monsoon")
  commandService.yargs.strict() // throw error if user passes in unrecognized command name or option
  commandService.exec()
}

setup()
