import { CommandModule } from "nestjs-command"

import { SyncModule } from "@modules/Sync/sync.module"
import { UserModule } from "@modules/User/user.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { ProductCommands } from "./commands/product.command"
import { SyncCommands } from "./commands/sync.command"
import { UserCommands } from "./commands/user.command"
import { ScriptsService } from "./services/scripts.service"

@Module({
  imports: [CommandModule, SyncModule, PrismaModule, UserModule],
  providers: [ScriptsService, UserCommands, SyncCommands, ProductCommands],
})
export class ScriptsModule {}
