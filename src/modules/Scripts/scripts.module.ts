import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"
import { CommandModule } from "nestjs-command"

import { DripModule } from "../Drip/drip.module"
import { UtilsModule } from "../Utils/utils.module"
import { DataCommands } from "./commands/data.command"
import { ProductCommands } from "./commands/product.command"
import { SyncCommands } from "./commands/sync.command"
import { UserCommands } from "./commands/user.command"
import { ScriptsService } from "./services/scripts.service"
import {
  AirtableModule,
  CronModule,
  PaymentModule,
  SyncModule,
  UserModule,
} from ".."

@Module({
  imports: [
    CommandModule,
    DripModule,
    SyncModule,
    PrismaModule,
    UserModule,
    UtilsModule,
    AirtableModule,
    PaymentModule,
    CronModule,
  ],
  providers: [
    ScriptsService,
    UserCommands,
    ProductCommands,
    SyncCommands,
    DataCommands,
  ],
})
export class ScriptsModule {}
