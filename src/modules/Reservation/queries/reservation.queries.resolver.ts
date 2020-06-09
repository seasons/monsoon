import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver()
export class ReservationQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async package(@Args() args, @Info() info) {
    return await this.prisma.binding.query.package(args, info)
  }

  @Query()
  async packages(@Args() args, @Info() info) {
    return await this.prisma.binding.query.packages(args, info)
  }

  @Query()
  async packagesConnection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.packagesConnection(args, info)
  }

  @Query()
  async reservation(@Args() args, @Info() info) {
    return await this.prisma.binding.query.reservation(args, info)
  }

  @Query()
  async reservations(@Args() args, @Info() info) {
    const data = await this.prisma.binding.query.reservations(args, info)
    return data
  }

  @Query()
  async reservationsConnection(@Args() args, @Info() info) {
    const data = await this.prisma.binding.query.reservationsConnection(
      args,
      info
    )
    return data
  }
}
