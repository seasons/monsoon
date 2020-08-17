import { User } from "@app/decorators"
import { UserRole } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"

@Resolver()
export class FitPicQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async fitPic(@Args() args, @Info() info) {
    return await this.prisma.binding.query.fitPic(args, info)
  }

  @Query()
  async fitPics(@Args() args, @Info() info, @User() user) {
    return await this.prisma.binding.query.fitPics(
      await this.sanitized({ args, forUser: user }),
      info
    )
  }

  @Query()
  async fitPicsConnection(@Args() args, @Info() info, @User() user) {
    return await this.prisma.binding.query.fitPicsConnection(
      await this.sanitized({ args, forUser: user }),
      info
    )
  }

  private async sanitized({
    args,
    forUser,
  }: {
    args: any
    forUser?: { roles: UserRole[] }
  }) {
    const adminOnlyFields = [
      "status",
      "status_not",
      "status_in",
      "status_not_in",
      "reports",
      "reports_every",
      "reports_some",
      "reports_none",
    ]

    if (forUser?.roles?.includes("Admin")) {
      return args
    } else {
      const adminOnlyFieldsUsed = adminOnlyFields.filter(
        field => args?.where?.[field] !== undefined
      )
      if (adminOnlyFieldsUsed.length > 0) {
        throw new Error(
          `The query's where parameter included one or more fields reserved for Admins only: ${adminOnlyFieldsUsed.join(
            ", "
          )}.`
        )
      }
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
