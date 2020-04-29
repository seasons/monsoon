import { Module } from "@nestjs/common"

import { FAQQueriesResolver } from "./queries/faq.queries"
import { FAQService } from "./services/faq.service"

@Module({
  providers: [FAQQueriesResolver, FAQService],
})
export class FAQModule {}
