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

@Resolver("Customer")
export class CustomerFieldsResolver {
  constructor(private readonly db: DBService) { }

  @ResolveProperty()
  async user(@User() user) {
    console.log("USER:", user)
    return user
  }

  @ResolveProperty()
  async detail(@Customer() customer) {
    console.log("CUSTOMER:", customer)
    const detail = await prisma.customer({
      id: customer.id
    }).detail()
    console.log("DETAIL:", detail)
    return detail
  }

}
