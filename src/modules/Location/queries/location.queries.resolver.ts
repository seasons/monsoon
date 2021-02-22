import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Context, Info, Query, Resolver } from "@nestjs/graphql"
import { addFragmentToInfo } from "graphql-binding"

import { LocationService } from "../services/location.service"

@Resolver()
export class LocationQueriesResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly locationService: LocationService
  ) {}

  //   @Query()
  //   async ordersConnection(@Args() args, @Info() info) {
  //     return await this.prisma.binding.query.ordersConnection(args, info)
  //   }
}
