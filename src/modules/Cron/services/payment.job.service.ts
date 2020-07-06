import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { PrismaService } from "@prisma/prisma.service"
import chargebee from "chargebee"

@Injectable()
export class PaymentScheduledJobs {
  private readonly logger = new Logger(PaymentScheduledJobs.name)

  constructor(private readonly prisma: PrismaService) {}

  // @Cron(CronExpression.EVERY_12_HOURS)
  @Cron(CronExpression.EVERY_MINUTE)
  async updatePlans() {
    chargebee.configure({
      site: process.env.CHARGEBEE_SITE,
      api_key: process.env.CHARGEE_API_KEY,
    })

    const request = await chargebee.plan.list().request()
    const list = request?.list || []

    list.forEach(item => {
      console.log("item", item)
      const data = {
        description: item.plan.description,
        planID: item.plan.id,
        name: item.plan.name,
        price: item.plan.price,
        status: item.plan.status,
      }

      this.prisma.client.upsertPaymentPlan({
        where: { planID: item.plan.id },
        create: data,
        update: data,
      })
    })

    this.logger.log("Update playment plans job ran")
  }
}
