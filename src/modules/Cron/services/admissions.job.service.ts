import { ErrorService } from "@app/modules/Error/services/error.service"
import { AdmissionsService } from "@app/modules/User/services/admissions.service"
import { CustomerService } from "@app/modules/User/services/customer.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

/*
- get this saving to the DB
- expose it in looker (in serviceable state, admissable)
- expose it in the admin
- get number of times authorized into the admin also
- update iOS track count for email matching
- update num times authorized count
- update auhtorizedAt field
*/

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

    const customers = await this.prisma.binding.query.customers(
      {
        where: {
          status_in: ["Invited", "Created", "Waitlisted", "Authorized"],
        },
      },
      this.customer.triageCustomerInfo
    )

    for (const cust of customers) {
      try {
        if (
          this.admissions.isTriageable(cust.status) ||
          cust.status === "Authorized"
        ) {
          await this.customer.triageCustomer(
            {
              id: cust.id,
            },
            "monsoon",
            true,
            cust
          )
        }
      } catch (err) {
        console.log(err)
        this.error.setUserContext(cust.user)
        this.error.setExtraContext(cust, "customer")
        this.error.captureError(err)
      }
    }

    console.log(`Update Admissions Fields Job done`)
  }
}
