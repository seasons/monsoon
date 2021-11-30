import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { merge, pick } from "lodash"

import { ReservationService } from "../services/reservation.service"

@Resolver()
export class ReservationQueriesResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryUtils: QueryUtilsService,
    private readonly reservationService: ReservationService
  ) {}

  @Query()
  async inboundReservations(@Args() { skip, take }, @Select() select) {
    const where = {
      status: "ReturnPending",
    } as any
    const args = {
      orderBy: {
        updatedAt: "asc",
      },
      skip,
      take,
      distinct: ["customerId"],
      select: merge(select, {
        id: true,
        customer: {
          select: {
            reservationPhysicalProducts: {
              where: {
                status: "ReturnPending",
              },
              select: {
                id: true,
              },
            },
          },
        },
      }),
    } as any

    return this.reservationService.reservationPhysicalProductConnection({
      args,
      where,
      countFnc: () =>
        this.prisma.client.customer.count({
          where: {
            reservationPhysicalProducts: {
              some: where,
            },
          },
        }),
    })
  }

  @Query()
  async outboundReservations(@Args() { skip, take }, @Select() select) {
    const where = {
      status: "Queued",
    } as any

    const args = {
      distinct: ["customerId"],
      orderBy: {
        updatedAt: "asc",
      },
      skip,
      take,
      select: merge(select, {
        id: true,
        customer: {
          select: {
            id: true,
            reservationPhysicalProducts: {
              where: {
                status: "Queued",
              },
              select: {
                id: true,
              },
            },
          },
        },
      }),
    } as any

    return this.reservationService.reservationPhysicalProductConnection({
      args,
      where,
      countFnc: () =>
        this.prisma.client.customer.count({
          where: {
            reservationPhysicalProducts: {
              some: where,
            },
          },
        }),
    })
  }

  @Query()
  async reservationProcessingStats() {
    return await this.reservationService.reservationProcessingStats()
  }

  @Query()
  async package(@Args() { where }, @Select() select) {
    return await this.queryUtils.resolveFindUnique({ where, select }, "Package")
  }

  @Query()
  async packages(@FindManyArgs() args) {
    return await this.queryUtils.resolveFindMany(args, "Package")
  }

  @Query()
  async packagesConnection(@Args() args, @Select() select) {
    return await this.queryUtils.resolveConnection(
      { ...args, select },
      "Package"
    )
  }

  @Query()
  async reservation(
    @Args() { where },
    @Select({ withFragment: `fragment EnsureId on Reservation {id}` }) select
  ) {
    return await this.queryUtils.resolveFindUnique(
      { where, select },
      "Reservation"
    )
  }

  @Query()
  async reservations(
    @FindManyArgs({ withFragment: `fragment EnsureId on Reservation {id}` })
    args
  ) {
    return await this.queryUtils.resolveFindMany(
      { orderBy: { createdAt: "desc" }, ...args },
      "Reservation"
    )
  }

  @Query()
  async reservationsConnection(@Args() args, @Select() select) {
    return await this.queryUtils.resolveConnection(
      { orderBy: "createdAt_DESC", ...args, select },
      "Reservation"
    )
  }
}
