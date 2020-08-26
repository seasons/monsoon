import { Customer, User } from "@app/decorators"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { User as PrismaUser } from "@prisma/index"
import { UserInputError } from "apollo-server"

import { CustomerService } from "../services/customer.service"

@Resolver()
export class CustomerMutationsResolver {
  constructor(
    private readonly customerService: CustomerService,
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly pushNotification: PushNotificationService,
    private readonly segment: SegmentService
  ) {}

  @Mutation()
  async addCustomerDetails(
    @Args() { details, event, status },
    @Info() info,
    @Customer() customer,
    @User() user
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
      this.segment.client.track({
        userId: user.id,
        event: eventNameMap[event],
      })
    }

    return returnData
  }

  @Mutation()
  async updateCustomer(@Args() args, @Info() info) {
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
      // Normal users
      if (customer.status === "Waitlisted") {
        await this.email.sendAuthorizedToSubscribeEmail(
          customer.user as PrismaUser
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

      this.segment.trackBecameAuthorized(customer.user.id, {
        previousStatus: customer.status,
        firstName: customer.user.firstName,
        lastName: customer.user.lastName,
        method: "Manual",
      })
    }
    return this.prisma.binding.mutation.updateCustomer(args, info)
  }

  @Mutation()
  async triageCustomer(@Customer() sessionCustomer) {
    const returnValue = await this.customerService.triageCustomer({
      id: sessionCustomer.id,
    })
    return returnValue
  }
}
