import { Module } from "@nestjs/common"
import { EmailService } from "./services/email.service"
import { PrismaModule } from "../../prisma/prisma.module"
import { EmailDataProvider } from "./services/email.data.service"
import { UtilsModule } from ".."

@Module({
  imports: [PrismaModule, UtilsModule],
  providers: [EmailService, EmailDataProvider],
  exports: [EmailService],
})
export class EmailModule {}
