import { DripSyncService } from "@app/modules/Drip/services/dripSync.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

@Injectable()
export class MarketingScheduledJobs {
  private readonly logger = new Logger(MarketingScheduledJobs.name)

  constructor(private readonly dripSync: DripSyncService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncCustomersToDrip() {
    this.logger.log("Run drip sync")
    const result = await this.dripSync.syncCustomersDifferential()
    this.logger.log(`drip sync results: `)
    this.logger.log(result)
  }
}
