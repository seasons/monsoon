import { Module } from "@nestjs/common"
import { CommandModule } from "nestjs-command";
import { UserModule } from "../User/user.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { ScriptsService } from "./services/scripts.service";
import { UserCommands } from "./commands/user.command";

@Module({
  imports: [
    CommandModule,
    PrismaModule,
    UserModule
  ],
  providers: [
    ScriptsService,
    UserCommands
  ],
})
export class ScriptsModule {}
