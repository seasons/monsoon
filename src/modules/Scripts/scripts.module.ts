import { Module } from "@nestjs/common"
import { CommandModule } from "nestjs-command"
import { PrismaModule } from "../../prisma/prisma.module"
import { SyncModule } from "../Sync/sync.module"
import { UserModule } from "../User/user.module"
import { SyncCommands } from "./commands/sync.command"
import { UserCommands } from "./commands/user.command"
import { ScriptsService } from "./services/scripts.service"

@Module({
  imports: [CommandModule, SyncModule, PrismaModule, UserModule],
  providers: [ScriptsService, UserCommands, SyncCommands],
})
export class ScriptsModule {}
