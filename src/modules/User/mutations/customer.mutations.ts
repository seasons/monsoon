import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { Select } from "@app/decorators/select.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { ApolloError, UserInputError } from "apollo-server"
import { pick } from "lodash"

import { CustomerService } from "../services/customer.service"

@Resolver()
export class CustomerMutationsResolver {
  constructor(
    private readonly customerService: CustomerService,
    private readonly segment: SegmentService,
    private readonly prisma: PrismaService
  ) {}

  @Mutation()
  async addCustomerDetails(
    @Args() { details, event, status },
    @Select() select,
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
      select
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
  async updateCustomer(
    @Args() args,
    @Select() select,
    @Application() application
  ) {
    return await this.customerService.updateCustomer(args, select, application)
  }

  @Mutation()
  async updateCreditBalance(
    @Args() { membershipId, amount, reason },
    @Customer() customer
  ) {
    if (reason.length <= 0) {
      throw new Error(`Must have a reason for updating a credit balance`)
    }

    if (amount === 0) {
      throw new Error(`A value greater than 0 must be entered for amount`)
    }
    const customerId = customer.id

    return await this.customerService.updateCreditBalance({
      membershipId,
      amount,
      reason,
      customerId,
    })
  }

  @Mutation()
  async triageCustomer() {
    throw new ApolloError("Triage is not available anymore")
  }

  @Mutation()
  async updateNotificationBarReceipt(
    @Customer() customer,
    @Args() { notification: { notificationBarId, viewCount, clickCount } },
    @Select() select
  ) {
    const r = await this.prisma.client.customerNotificationBarReceipt.findFirst(
      {
        where: {
          AND: [{ customer: { id: customer.id } }, { notificationBarId }],
        },
      }
    )

    const data = await this.prisma.client.customerNotificationBarReceipt.upsert(
      {
        where: { id: r?.id || "" },
        create: {
          notificationBarId,
          viewCount,
          clickCount,
          customer: { connect: { id: customer.id } },
        },
        update: { viewCount, clickCount },
        select,
      }
    )
    return data
  }
  @Mutation()
  async cancelCustomer(@Args() { customerId }) {
    return await this.customerService.cancelCustomer(customerId)
  }
}
