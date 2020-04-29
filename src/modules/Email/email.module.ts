import { EmailDataProvider } from "./services/email.data.service"
import { EmailService } from "./services/email.service"
import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { ProductModule } from "../Product/product.module"
import { UtilsModule } from "../Utils/utils.module"

@Module({
  imports: [PrismaModule, UtilsModule, ProductModule],
  providers: [EmailService, EmailDataProvider],
  exports: [EmailService],
})
export class EmailModule {}
