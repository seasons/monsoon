import { User } from "@app/decorators"
import { FitPicReportStatus } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { FitPicService } from "../services/fitpic.service"

@Resolver()
export class FitPicMutationsResolver {
  constructor(
    private readonly fitPic: FitPicService,
    private readonly prisma: PrismaService
  ) {}

  @Mutation()
  async submitFitPic(@Args() args, @User() user) {
    return this.fitPic.submitFitPic(args, user)
  }

  @Mutation()
  async reportFitPic(@Args() args, @User() user) {
    return this.fitPic.reportFitPic(args, user)
  }

  @Mutation()
  async updateFitPicApproved(@Args() args) {
    return this.fitPic.updateFitPicApproved(args)
  }

  @Mutation()
  async deleteFitPic(@Args() args) {
    return this.fitPic.deleteFitPic(args)
  }

  @Mutation()
  async updateFitPicReportStatus(
    @Args() { id, status }: { id: string; status: FitPicReportStatus }
  ) {
    await this.prisma.client.updateFitPicReport({
      data: { status },
      where: { id },
    })
    return true
  }
}
