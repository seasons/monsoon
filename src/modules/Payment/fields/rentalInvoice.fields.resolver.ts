import { Customer } from "@app/decorators"
import { CustomerMembershipService } from "@app/modules/Customer/services/customerMembership.service"
import { ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("RentalInvoice")
export class RentalInvoiceFieldsResolver {
  constructor(private readonly customerMembership: CustomerMembershipService) {}

  @ResolveField()
  async estimatedTotal(@Customer() customer) {
    const total = await this.customerMembership.calculateCurrentBalance(
      customer.id,
      {
        upTo: "billingEnd",
      }
    )

    return total
  }
}
