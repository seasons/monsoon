import {
  Resolver,
  ResolveProperty,
  Context,
  Info,
} from "@nestjs/graphql"
import { head } from "lodash"
import { prisma } from "../../../prisma"
import { User, Customer } from "../../../nest_decorators"
import { DBService } from "../../../prisma/DB.service"

@Resolver("CustomerDetail")
export class CustomerDetailFieldsResolver {
  constructor(private readonly db: DBService) { }

  @ResolveProperty()
  async shippingAddress(@Customer() customer) {
    const shippingAddress = await prisma.customer({
      id: customer.id
    }).detail().shippingAddress()
    return shippingAddress
  }

}
