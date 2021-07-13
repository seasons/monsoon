import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { Args, Query, Resolver } from "@nestjs/graphql"

@Resolver()
export class ReservationQueriesResolver {
  constructor(private readonly queryUtils: QueryUtilsService) {}

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
      { orderBy: { createdAt: "desc" }, ...args, select },
      "Reservation"
    )
  }
}
