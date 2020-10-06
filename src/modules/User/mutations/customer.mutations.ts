import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { User as PrismaUser } from "@prisma/index"
import { UserInputError } from "apollo-server"
import { pick } from "lodash"

import { AdmissionsService } from "../services/admissions.service"
import { CustomerService } from "../services/customer.service"

@Resolver()
export class CustomerMutationsResolver {
  constructor(
    private readonly customerService: CustomerService,
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly pushNotification: PushNotificationService,
    private readonly segment: SegmentService,
    private readonly admissions: AdmissionsService,
    private readonly sms: SMSService
  ) {}

  @Mutation()
  async addCustomerDetails(
    @Args() { details, event, status },
    @Info() info,
    @Customer() customer,
    @User() user,
    @Application() application
  ) {
    // They should not have included any "id" in the input
    if (details.id != null) {
      throw new UserInputError("payload should not include id")
    }

    const returnData = await this.customerService.addCustomerDetails(
      { details, status },
      customer,
      user,
      info
    )

    // Track the event, if its been passed
    const eventNameMap = { CompletedWaitlistForm: "Completed Waitlist Form" }
    if (!!event) {
      this.segment.track(user.id, eventNameMap[event], {
        ...pick(user, ["firstName", "lastName", "email"]),
        application,
      })
    }

    return returnData
  }

  @Mutation()
  async updateCustomer(@Args() args, @Info() info, @Application() application) {
    const { where, data } = args
    const customer = await this.prisma.binding.query.customer(
      {
        where,
      },
      `{
        id
        user {
          id
          email
          firstName
          lastName
        }
        status
      }`
    )

    if (
      ["Waitlisted", "Invited"].includes(customer.status) &&
      data.status &&
      data.status === "Authorized"
    ) {
      const haveSufficientInventory = await this.admissions.haveSufficientInventoryToServiceCustomer(
        where
      )
      if (!haveSufficientInventory) {
        throw new Error("Can not authorize user. Insufficient inventory")
      }

      // Normal users
      if (customer.status === "Waitlisted") {
        await this.email.sendAuthorizedEmail(
          customer.user as PrismaUser,
          "manual"
        )
      }
      // Users we invited off the admin
      if (customer.status === "Invited") {
        await this.email.sendPriorityAccessEmail(customer.user as PrismaUser)
      }

      // either kind of user
      await this.pushNotification.pushNotifyUser({
        email: customer.user.email,
        pushNotifID: "CompleteAccount",
      })
      await this.sms.sendSMSMessage({
        to: { id: customer.user.id },
        body:
          `${customer.user.firstName}, it's Seasons. You're in. You'll soon have access to hundreds of new styles without the stress ` +
          `of commitment. To finish setting up your membership, you will need to download or sign in on the app, then select a plan. ` +
          `https://szns.co/app. Due to demand, your invitation will expire in 48 hours. If you have any questions please contact membership@seasons.nyc.`,
        mediaUrls: [
          "https://seasons-images.s3.amazonaws.com/email-images/AuthorizedHero.jpg",
        ],
      })

      this.segment.trackBecameAuthorized(customer.user.id, {
        previousStatus: customer.status,
        firstName: customer.user.firstName,
        lastName: customer.user.lastName,
        email: customer.user.email,
        method: "Manual",
        application,
      })
    }
    return this.prisma.binding.mutation.updateCustomer(args, info)
  }

  @Mutation()
  async triageCustomer(
    @Customer() sessionCustomer,
    @Application() application
  ) {
    const returnValue = await this.customerService.triageCustomer(
      {
        id: sessionCustomer.id,
      },
      application,
      false
    )
    return returnValue
  }
}
