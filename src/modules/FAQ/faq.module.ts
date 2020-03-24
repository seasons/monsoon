import { Module } from "@nestjs/common"
import { FAQQueriesResolver } from "./queries/faq.queries";
import { FAQService } from "./services/faq.service";
import { PrismaModule } from "../../prisma/prisma.module"

@Module({
  imports: [
    PrismaModule,
  ],
  providers: [
    FAQQueriesResolver,
    FAQService
  ]
})
export class FAQModule { }
