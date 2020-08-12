import { User } from "@app/decorators"
import { PrismaService } from "@app/prisma/prisma.service"
import { AuthUtilsService } from "@modules/User/services/auth.utils.service"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { omit } from "lodash"

@Resolver()
export class FitPicQueriesResolver {
  constructor(
    private readonly authUtils: AuthUtilsService,
    private readonly prisma: PrismaService
  ) {}

  private async sanitized({
    args,
    forUser,
  }: {
    args: any
    forUser?: { id: string }
  }) {
    const adminOnlyFields = [
      "adminFilter",
      "approved",
      "approved_not",
      "reports",
      "reports_every",
      "reports_some",
      "reports_none",
    ]

    if (await this.authUtils.isAdmin(forUser)) {
      if (args?.where?.adminFilter) {
        let filter = {}
        switch (args.where.adminFilter) {
          case "Live":
            filter = { approved: true }
            break
          case "Submitted":
            filter = { reports_none: {}, approved: false }
            break
          case "Reported":
            filter = { reports_some: { status: "Pending" } }
            break
          case "Unapproved":
            filter = { reports_some: {}, approved: false }
            break
        }
        return {
          ...args,
          where: omit({ ...args?.where, ...filter }, "adminFilter"),
        }
      }
      return args
    } else {
      if (adminOnlyFields.some(field => args?.where?.[field] !== undefined)) {
        throw new Error(
          "The query's where parameter included a field reserved for Admins only."
        )
      }
      return {
        ...args,
        where: {
          ...args?.where,
          approved: true,
        },
      }
    }
  }

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
}
