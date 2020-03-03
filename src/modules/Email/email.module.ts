import { Module } from "@nestjs/common"
import { EmailService } from "./services/email.service"
import { PrismaModule } from "../../prisma/prisma.module"
import { UtilsModule } from "../Utils/utils.module"
import { EmailDataService } from "./services/email.data.service"

@Module({
  imports: [PrismaModule, UtilsModule],
  providers: [EmailService, EmailDataService],
  exports: [EmailService],
})
export class EmailModule {}
