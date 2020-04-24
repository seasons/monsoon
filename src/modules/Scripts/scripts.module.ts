import {
  AirtableModule,
  CronModule,
  PaymentModule,
  SyncModule,
  UserModule,
  UtilsModule,
} from ".."

import { CommandModule } from "nestjs-command"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"
import { ProductCommands } from "./commands/product.command"
import { ScriptsService } from "./services/scripts.service"
import { SyncCommands } from "./commands/sync.command"
import { UserCommands } from "./commands/user.command"

@Module({
  imports: [
    CommandModule,
    SyncModule,
    PrismaModule,
    UserModule,
    UtilsModule,
    AirtableModule,
    PaymentModule,
    CronModule,
  ],
  providers: [ScriptsService, UserCommands, ProductCommands, SyncCommands],
})
export class ScriptsModule {}
