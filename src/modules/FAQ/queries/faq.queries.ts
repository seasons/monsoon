import { Resolver, Query } from "@nestjs/graphql"
import { FAQService } from "../services/faq.service"
import { User, Customer } from "../../../nest_decorators"

@Resolver()
export class FAQQueriesResolver {
  constructor(private readonly faqService: FAQService) { }

  @Query()
  faq(@User() user) {
    return {
      sections: this.faqService.getSections(user)
    }
  }

}