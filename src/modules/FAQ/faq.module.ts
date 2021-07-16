import { FAQService } from "@modules/FAQ/services/faq.service"
import { Module } from "@nestjs/common"

import { FAQQueriesResolver } from "./queries/faq.queries"

@Module({
  providers: [FAQQueriesResolver, FAQService],
})
export class FAQModule {}
