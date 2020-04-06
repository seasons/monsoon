import { FAQQueriesResolver } from "./queries/faq.queries"
import { FAQService } from "./services/faq.service"
import { Module } from "@nestjs/common"

@Module({
  providers: [FAQQueriesResolver, FAQService],
})
export class FAQModule {}
