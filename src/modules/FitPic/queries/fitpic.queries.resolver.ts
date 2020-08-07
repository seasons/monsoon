import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"

import { FitPicService } from "../services/fitpic.service"

@Resolver()
export class FitPicQueriesResolver {
  constructor(
    private readonly fitPic: FitPicService,
    private readonly prisma: PrismaService
  ) {}

  @Query()
  async fitPics(@Args() args, @Info() info) {
    return await this.prisma.binding.query.fitPics(args, info)
  }

  @Query()
  async publicFitPics(@Args() args, @Info() info) {
    return await this.fitPic.publicFitPics(args, info)
  }
}
