import { DripSyncService } from "@app/modules/Drip/services/dripSync.service"
import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

@Injectable()
export class MarketingScheduledJobs {
  constructor(private readonly dripSync: DripSyncService) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async syncCustomers() {
    await this.dripSync.syncCustomers()
  }
}
