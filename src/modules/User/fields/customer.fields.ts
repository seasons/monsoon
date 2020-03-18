import {
  Resolver,
  ResolveProperty,
  Context,
  Info,
} from "@nestjs/graphql"
import { head } from "lodash"
import { prisma } from "../../../prisma"
import { User, Customer } from "../../../nest_decorators"
import { DBService } from "../../../prisma/db.service"

@Resolver("Customer")
export class CustomerFieldsResolver {
  constructor(private readonly db: DBService) { }

  @ResolveProperty()
  async user(@User() user) {
    return user
  }

  @ResolveProperty()
  async detail(@Customer() customer) {
    return await prisma.customer({
      id: customer.id
    }).detail()
  }

}
