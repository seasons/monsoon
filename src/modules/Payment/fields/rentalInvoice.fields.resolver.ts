import { Customer } from "@app/decorators"
import { ResolveField, Resolver } from "@nestjs/graphql"

import { RentalService } from "../services/rental.service"

@Resolver("RentalInvoice")
export class RentalInvoiceFieldsResolver {
  constructor(private readonly rental: RentalService) {}

  @ResolveField()
  async estimatedTotal(@Customer() customer) {
    const total = await this.rental.calculateCurrentBalance(customer.id, {
      upTo: "billingEnd",
    })

    return total
  }
}
