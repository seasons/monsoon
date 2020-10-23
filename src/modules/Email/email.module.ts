import { Module } from "@nestjs/common"

import { PrismaModule } from "../../prisma/prisma.module"
import { ErrorModule } from "../Error/error.module"
import { ImageModule } from "../Image/image.module"
import { UtilsModule } from "../Utils/utils.module"
import { EmailDataProvider } from "./services/email.data.service"
import { EmailService } from "./services/email.service"
import { EmailUtilsService } from "./services/email.utils.service"

@Module({
  imports: [PrismaModule, UtilsModule, ErrorModule, ImageModule],
  providers: [EmailService, EmailDataProvider, EmailUtilsService],
  exports: [EmailService],
})
export class EmailModule {}
