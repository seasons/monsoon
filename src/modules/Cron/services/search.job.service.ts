import { SearchService } from "@app/modules/Search"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

@Injectable()
export class SearchScheduledJobs {
  private readonly logger = new Logger(SearchScheduledJobs.name)

  constructor(private readonly search: SearchService) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async indexProducts() {
    this.logger.log("Index products job beginning")
    await this.search.indexProducts()
    this.logger.log("Index products job completed")
  }
}
