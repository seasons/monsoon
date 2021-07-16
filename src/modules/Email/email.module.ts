import { ErrorModule } from "@modules/Error/error.module"
import { ImageModule } from "@modules/Image/image.module"
import { PrismaModule } from "@modules/Prisma/prisma.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module } from "@nestjs/common"

import { EmailService } from "./services/email.service"
import { EmailUtilsService } from "./services/email.utils.service"

@Module({
  imports: [PrismaModule, UtilsModule, ErrorModule, ImageModule],
  providers: [EmailService, EmailUtilsService],
  exports: [EmailService],
})
export class EmailModule {}
