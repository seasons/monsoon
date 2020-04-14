import { CommandModule } from "nestjs-command"
import { Module } from "@nestjs/common"
import { OverridableAirtableBaseService } from "./services/airtable.service"
import { OverrideablePrismaService } from "./services/prisma.service"
import { PrismaModule } from "@prisma/prisma.module"
// import { ProductCommands } from "./commands/product.command"
import { ScriptsService } from "./services/scripts.service"
// import { SyncCommands } from "./commands/sync.command"
import { SyncModule } from "@modules/Sync/sync.module"
import { UserCommands } from "./commands/user.command"
import { UserModule } from "@modules/User/user.module"
import { UtilsModule } from ".."

@Module({
  imports: [CommandModule, SyncModule, PrismaModule, UserModule, UtilsModule],
  providers: [ScriptsService, UserCommands],
})
export class ScriptsModule {}
