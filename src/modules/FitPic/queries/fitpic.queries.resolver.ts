import { User } from "@app/decorators"
import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { UserRole } from "@prisma/client"

@Resolver()
export class FitPicQueriesResolver {
  constructor(private readonly queryUtils: QueryUtilsService) {}

  @Query()
  async fitPic(@Args() { where }, @Select() select) {
    return await this.queryUtils.resolveFindUnique({ where, select }, "FitPic")
  }

  @Query()
  async fitPics(@FindManyArgs() args, @User() user) {
    return this.queryUtils.resolveFindMany(
      this.sanitized({ args, forUser: user }),
      "FitPic"
    )
  }

  @Query()
  async fitPicsConnection(@Args() args, @User() user, @Select() select) {
    return this.queryUtils.resolveConnection(
      { ...this.sanitized({ args, forUser: user }), select },
      "FitPic"
    )
  }

  private sanitized({
    args,
    forUser,
  }: {
    args: any
    forUser?: { roles: UserRole[] }
  }) {
    if (forUser?.roles?.includes("Admin")) {
      return args
    } else {
      return {
        ...args,
        where: {
          ...args?.where,
          status: "Published",
        },
      }
    }
  }
}
