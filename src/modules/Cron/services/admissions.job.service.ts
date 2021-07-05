import { ErrorService } from "@app/modules/Error/services/error.service"
import { AdmissionsService } from "@app/modules/User/services/admissions.service"
import { CustomerService } from "@app/modules/User/services/customer.service"
import { CustomerStatus } from "@app/prisma"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

@Injectable()
export class AdmissionsScheduledJobs {
  private readonly logger = new Logger(`Cron: ${AdmissionsScheduledJobs.name}`)

  constructor(
    private readonly prisma: PrismaService,
    private readonly admissions: AdmissionsService,
    private readonly customer: CustomerService,
    private readonly error: ErrorService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async updateAdmissionsFields() {
    this.logger.log(`Start update admissions field job`)

    const customers = await this.prisma.client2.customer.findMany({
      where: {
        status: { in: ["Invited", "Created", "Waitlisted", "Authorized"] },
      },
      select: this.customer.triageCustomerSelect,
    })

    let i = 0
    for (const cust of customers) {
      console.log(`${i++} of ${customers.length}`)
      try {
        if (
          this.admissions.isTriageable(cust.status as CustomerStatus) ||
          cust.status === "Authorized"
        ) {
          await this.customer.triageCustomer(
            {
              id: cust.id,
            },
            "monsoon",
            true
          )
        }
      } catch (err) {
        console.log(err)
        this.error.setUserContext(cust.user)
        this.error.setExtraContext(cust, "customer")
        this.error.captureError(err)
      }
    }

    this.logger.log(`Update Admissions Fields Job done`)
  }
}
