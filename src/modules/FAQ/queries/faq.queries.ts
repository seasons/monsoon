import { Query, Resolver } from "@nestjs/graphql"

import { FAQService } from "../services/faq.service"

@Resolver()
export class FAQQueriesResolver {
  constructor(private readonly faqService: FAQService) {}

  @Query()
  faq() {
    return {
      sections: this.faqService.getSections(),
    }
  }
}
