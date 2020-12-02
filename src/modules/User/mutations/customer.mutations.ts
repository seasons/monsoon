import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { UserInputError } from "apollo-server"
import { pick } from "lodash"

import { CustomerService } from "../services/customer.service"

@Resolver()
export class CustomerMutationsResolver {
  constructor(
    private readonly customerService: CustomerService,
    private readonly segment: SegmentService
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
    return await this.customerService.updateCustomer(args, info, application)
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
}
