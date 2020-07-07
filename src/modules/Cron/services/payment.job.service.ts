import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { PrismaService } from "@prisma/prisma.service"
import chargebee from "chargebee"

@Injectable()
export class PaymentScheduledJobs {
  private readonly logger = new Logger(PaymentScheduledJobs.name)

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async updatePlans() {
    const request = await chargebee.plan.list().request()
    const list = request?.list || []

    list.forEach(async item => {
      if (item?.plan?.id) {
        const data = {
          description: item.plan.description,
          planID: item.plan.id,
          name: item.plan.name,
          price: item.plan.price,
          status: item.plan.status,
        }

        await this.prisma.client.upsertPaymentPlan({
          where: { planID: item.plan.id },
          create: data,
          update: data,
        })
      }
    })

    this.logger.log("Update playment plans job ran")
  }
}
