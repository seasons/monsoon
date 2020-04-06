import { Module } from "@nestjs/common"
import { CommandModule } from "nestjs-command"
import { PrismaModule } from "../../prisma/prisma.module"
import { SyncModule } from "../Sync/sync.module"
import { UserModule } from "../User/user.module"
import { SyncCommands } from "./commands/sync.command"
import { UserCommands } from "./commands/user.command"
import { ScriptsService } from "./services/scripts.service"
import { ProductCommands } from "./commands/product.command"
import { UtilsModule } from ".."

@Module({
  imports: [CommandModule, SyncModule, PrismaModule, UserModule, UtilsModule],
  providers: [ScriptsService, UserCommands, SyncCommands, ProductCommands],
})
export class ScriptsModule {}
