import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { addFragmentToInfo } from "graphql-binding"

import { AdmissionsService } from "../services/admissions.service"

@Resolver()
export class CustomerQueriesResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly admissions: AdmissionsService
  ) {}

  @Query()
  async customer(@Args() args, @Info() info) {
    return await this.prisma.binding.query.customer(
      args,
      addFragmentToInfo(info, `fragment EnsureId on Customer {id}`)
    )
  }

  @Query()
  async customers(@Args() args, @Info() info) {
    return await this.prisma.binding.query.customers(
      args,
      addFragmentToInfo(info, `fragment EnsureId on Customer {id}`)
    )
  }

  @Query()
  async customersConnection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.customersConnection(args, info)
  }

  @Query()
  async shouldAdmitCustomer(@Args() { where }) {
    return await this.admissions.shouldAdmitCustomer(where)
  }
}
