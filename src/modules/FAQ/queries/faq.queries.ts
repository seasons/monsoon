import { Args, Query, Resolver } from "@nestjs/graphql"

import { FAQService } from "../services/faq.service"

@Resolver()
export class FAQQueriesResolver {
  constructor(private readonly faqService: FAQService) {}

  @Query()
  faq(@Args() { sectionType }) {
    return {
      sections: this.faqService.getSections(sectionType),
    }
  }
}
