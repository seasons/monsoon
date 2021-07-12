import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { Select } from "@app/decorators/select.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { UserInputError } from "apollo-server"
import { head, pick } from "lodash"

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
  async triageCustomer(
    @Customer() sessionCustomer,
    @Application() application
  ) {
    const { status } = await this.customerService.triageCustomer(
      {
        id: sessionCustomer.id,
      },
      application,
      false
    )

    return status
  }

  @Mutation()
  async updateNotificationBarReceipt(
    @Customer() customer,
    @Args() { notification: { notificationBarId, viewCount, clickCount } },
    @Info() info
  ) {
    const r = head(
      await this.prisma.client.customerNotificationBarReceipts({
        where: {
          AND: [{ customer: { id: customer.id } }, { notificationBarId }],
        },
      })
    )
    return this.prisma.binding.mutation.upsertCustomerNotificationBarReceipt(
      {
        where: { id: r?.id || "" },
        create: {
          notificationBarId,
          viewCount,
          clickCount,
          customer: { connect: { id: customer.id } },
        },
        update: { viewCount, clickCount },
      },
      info
    )
  }
}
