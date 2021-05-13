import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
import { addFragmentToInfo } from "graphql-binding"

import { AdmissionsService } from "../services/admissions.service"

@Resolver()
export class UserQueriesResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly admissions: AdmissionsService
  ) {}

  @Query()
  async user(@Args() args, @Info() info) {
    return await this.prisma.binding.query.user(
      args,
      addFragmentToInfo(info, `fragment EnsureIdAndEmail on User {id email}`)
    )
  }

  @Query()
  async users(@Args() args, @Info() info) {
    return await this.prisma.binding.query.users(
      args,
      addFragmentToInfo(info, `fragment EnsureIdAndEmail on User {id email}`)
    )
  }

  @Query()
  async usersConnection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.usersConnection(args, info)
  }

  @Query()
  async zipcodeServiced(@Args() args, @Info() info) {
    const data = await this.admissions.zipcodeAllowed(args.zipcode)
    return data.pass
  }
}
