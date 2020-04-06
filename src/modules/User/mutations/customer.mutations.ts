import { Mutation, Args, Resolver, Info } from "@nestjs/graphql"
import { UserInputError } from "apollo-server"
import { Analytics, Customer, User } from "@app/nest_decorators"
import { CustomerService } from "../services/customer.service"

@Resolver()
export class CustomerMutationsResolver {
  constructor(private readonly customerService: CustomerService) {}

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
}
