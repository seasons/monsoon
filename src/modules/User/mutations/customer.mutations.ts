import { Analytics, Customer, User } from "@app/decorators"
import { EmailService } from "@app/modules/Email/services/email.service"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { UserInputError } from "apollo-server"
import { first } from "lodash"

import { CustomerService } from "../services/customer.service"

@Resolver()
export class CustomerMutationsResolver {
  constructor(
    private readonly customerService: CustomerService,
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly pushNotification: PushNotificationService
  ) {}

  @Mutation()
  async addCustomerDetails(
    @Args() { details, event, status },
    @Info() info,
    @Analytics() analytics,
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
      analytics.track({
        userId: user.id,
        event: eventNameMap[event],
      })
    }

    return returnData
  }

  @Mutation()
  async updateCustomer(
    @Args() args,
    @Info() info,
    @Analytics() analytics,
    @Customer() sessionCustomer,
    @User() user
  ) {
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
        }
        status
      }`
    )

    if (
      customer.status === "Waitlisted" &&
      data.status &&
      data.status === "Authorized"
    ) {
      this.email.sendWelcomeToSeasonsEmail(user)
      this.pushNotification.pushNotifyUser({
        email: user.email,
        pushNotifID: "Welcome",
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
