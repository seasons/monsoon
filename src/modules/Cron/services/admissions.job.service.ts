import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { AdmissionsService } from "@app/modules/User/services/admissions.service"
import { CustomerService } from "@app/modules/User/services/customer.service"
import {
  CustomerAdmissionsData,
  CustomerAdmissionsDataWhereUniqueInput,
  InAdmissableReason,
} from "@app/prisma"
import { Customer } from "@app/prisma/prisma.binding"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { find, head } from "lodash"

/*
- get this saving to the DB
- expose it in looker (in serviceable state, admissable)
- expose it in the admin
- get number of times authorized into the admin also
- update iOS track count for email matching
- update num times authorized count
- update auhtorizedAt field
*/

type AdmissibleRecordWhereSubKey =
  | "withServiceableZipcode"
  | "withUnserviceableZipcode"

interface InadmissableAdmissionsDatataWhereUniqueInputs {
  withServiceableZipcode?: CustomerAdmissionsDataWhereUniqueInput
  withUnserviceableZipcode?: CustomerAdmissionsDataWhereUniqueInput
}

interface AllAdmissionsDataWhereUniqueInputs {
  admissable: CustomerAdmissionsDataWhereUniqueInput
  AutomaticAdmissionsFlagOff: InadmissableAdmissionsDatataWhereUniqueInputs
  InsufficientInventory: InadmissableAdmissionsDatataWhereUniqueInputs
  OpsThresholdExceeded: InadmissableAdmissionsDatataWhereUniqueInputs
  UnserviceableZipcode: InadmissableAdmissionsDatataWhereUniqueInputs
  UnsupportedPlatform: InadmissableAdmissionsDatataWhereUniqueInputs
}

interface UpdateCustomerAdmissionsDataInput {
  cust: Customer
  admissable: boolean
  inadmissableReason?: InAdmissableReason
  inServiceableZipcode?: boolean
}

@Injectable()
export class AdmissionsScheduledJobs {
  private readonly logger = new Logger(`Cron: ${AdmissionsScheduledJobs.name}`)

  private admissionsDataWheres: AllAdmissionsDataWhereUniqueInputs
  private updates = {}

  constructor(
    private readonly prisma: PrismaService,
    private readonly admissions: AdmissionsService,
    private readonly customer: CustomerService,
    private readonly error: ErrorService,
    private readonly segment: SegmentService
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
      `{
          id
          status
          detail {
            shippingAddress {
                zipCode
            }
            topSizes
            waistSizes
          }
          user {
            id
            firstName
            lastName
            email
          }
          admissions {
              id
              inServiceableZipcode
              admissable
              inAdmissableReason
          }
      }`
    )

    await this.setAdmissionsDataWheres()

    for (const cust of customers) {
      try {
        await this.updateCustomer(cust)
      } catch (err) {
        console.log(err)
        this.error.setUserContext(cust.user)
        this.error.setExtraContext(cust, "customer")
        this.error.captureError(err)
      }
    }

    console.log(`Update Admissions Fields Job done`)
    this.logger.log(this.updates)

    // Reset it for the next run
    this.updates = {}
  }

  private async updateCustomer(cust) {
    const { pass: inServiceableZipcode } = this.admissions.zipcodeAllowed(
      cust.detail?.shippingAddress?.zipCode
    )

    // If possible, check if they are admissable. If needed, update their data.
    if (
      this.admissions.isTriageable(cust.status) ||
      cust.status === "Authorized"
    ) {
      const { status, waitlistReason } = await this.customer.triageCustomer(
        {
          id: cust.id,
        },
        "monsoon",
        true,
        cust
      )
      switch (status) {
        case "Authorized":
          if (this.shouldUpdateAdmissableCustomer(cust)) {
            await this.updateCustomerAdmissionsData({ cust, admissable: true })
          }
          break
        case "Waitlisted":
          if (
            this.shouldUpdateInadmissableCustomer(
              cust,
              inServiceableZipcode,
              waitlistReason
            )
          ) {
            await this.updateCustomerAdmissionsData({
              cust,
              admissable: false,
              inadmissableReason: waitlistReason,
              inServiceableZipcode,
            })
          }
          break
        default:
          throw new Error(
            `Invalid status returned from triageCustomer: ${cust.status}`
          )
      }
    } else {
      this.updates[cust.user.email] = `Not triageable.`
    }
  }
  private getZipcodeKey(
    inServiceableZipcode: boolean
  ): AdmissibleRecordWhereSubKey {
    return inServiceableZipcode
      ? "withServiceableZipcode"
      : "withUnserviceableZipcode"
  }

  private shouldUpdateAdmissableCustomer(cust) {
    return !cust.admission?.admissable
  }

  private shouldUpdateInadmissableCustomer(
    cust,
    inServiceableZipcode,
    waitlistReason
  ) {
    return (
      cust.admissions?.inServiceableZipcode !== inServiceableZipcode ||
      cust.admissions?.inAdmissableReason !== waitlistReason
    )
  }

  private async setAdmissionsDataWheres() {
    const customerAdmissionsDataRecords = await this.prisma.client.customerAdmissionsDatas(
      {}
    )

    // admissable record
    const inadmissableReasons = [
      "AutomaticAdmissionsFlagOff",
      "InsufficientInventory",
      "OpsThresholdExceeded",
      "UnserviceableZipcode",
      "UnsupportedPlatform",
      "Untriageable",
    ] as InAdmissableReason[]

    this.admissionsDataWheres = {
      admissable: {
        id: find(customerAdmissionsDataRecords, a => a.admissable)?.id,
      },
      ...(inadmissableReasons.reduce(
        (acc, curval) => ({
          ...acc,
          ...this.getInAdmissableRecordsWheres(
            customerAdmissionsDataRecords,
            curval
          ),
        }),
        {}
      ) as Omit<AllAdmissionsDataWhereUniqueInputs, "admissable">),
    }
  }

  private async updateCustomerAdmissionsData({
    cust,
    admissable,
    inadmissableReason,
    inServiceableZipcode,
  }: UpdateCustomerAdmissionsDataInput) {
    let updateAndIdentifyPayload
    if (admissable) {
      await this.prisma.client.updateCustomer({
        where: { id: cust.id },
        data: {
          admissions: { connect: this.admissionsDataWheres.admissable },
        },
      })
      updateAndIdentifyPayload = {
        admissable: true,
        inServiceableZipcode: true,
      }
    } else {
      await this.prisma.client.updateCustomer({
        where: { id: cust.id },
        data: {
          admissions: {
            connect: this.admissionsDataWheres[inadmissableReason][
              this.getZipcodeKey(inServiceableZipcode)
            ],
          },
        },
      })
      updateAndIdentifyPayload = {
        admissable: false,
        inadmissableReason,
        inServiceableZipcode,
      }
    }

    this.updates[cust.user.email] = updateAndIdentifyPayload
    this.segment.identify(cust.user.id, updateAndIdentifyPayload)
  }

  private getInAdmissableRecordsWheres(
    allRecords: CustomerAdmissionsData[],
    reason: InAdmissableReason
  ) {
    const subRecords = allRecords.filter(a => a.inAdmissableReason === reason)

    const withServiceableZipcode = {
      id: find(subRecords, a => a.inServiceableZipcode)?.id,
    }
    const withUnserviceableZipcode = {
      id: find(subRecords, a => !a.inServiceableZipcode)?.id,
    }

    return {
      [reason]: { withServiceableZipcode, withUnserviceableZipcode },
    }
  }
}
