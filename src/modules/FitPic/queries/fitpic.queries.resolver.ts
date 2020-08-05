import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Context, Info, Query, Resolver } from "@nestjs/graphql"

import { FitPicService } from "../services/fitpic.service"

@Resolver()
export class FitPicQueriesResolver {
  constructor(
    private readonly fitPic: FitPicService,
    private readonly prisma: PrismaService
  ) {}

  @Query()
  async fitPics(@Args() args, @Info() info, @Context() ctx) {
    return await this.fitPic.fitPics(args, info, ctx)
  }

  @Query()
  async fitPicReports(@Args() { where }, @Info() info) {
    return await this.prisma.binding.query.fitPicReports({ where }, info)
  }
}
