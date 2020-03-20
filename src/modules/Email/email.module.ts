import { Module } from "@nestjs/common"
import { EmailService } from "./services/email.service"
import { PrismaModule } from "../../prisma/prisma.module"
import { UtilsModule } from "../Utils/utils.module"
import { EmailDataProvider } from "./services/email.data.service"

@Module({
  imports: [PrismaModule, UtilsModule],
  providers: [EmailService, EmailDataProvider],
  exports: [EmailService],
})
export class EmailModule {}
