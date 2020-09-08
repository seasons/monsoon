import { ReservationWhereInput } from "@app/prisma"
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
    const { where } = args
    const options: ReservationWhereInput = {}

    if (where.phase) {
      const clause = {
        slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
      }
      switch (where.phase) {
        case "CustomerToBusiness":
          options.AND = {
            status_not: "Completed",
            lastLocation: {
              NOT: clause,
            },
          }
          break
        case "BusinessToCustomer":
          options.lastLocation = clause
          break
      }
    }
    const data = await this.prisma.binding.query.reservations(
      {
        ...args,
        where: {
          ...args.where,
          ...options,
        },
      },
      info
    )
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
