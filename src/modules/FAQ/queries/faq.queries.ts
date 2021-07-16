import { FAQService } from "@modules/FAQ/services/faq.service"
import { Args, Query, Resolver } from "@nestjs/graphql"

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
