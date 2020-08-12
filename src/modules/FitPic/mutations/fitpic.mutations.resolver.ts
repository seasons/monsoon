import { Customer, User } from "@app/decorators"
import { FitPicReportUpdateInput } from "@app/prisma"
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
  async submitFitPic(@Args() args, @User() user, @Customer() customer) {
    return this.fitPic.submitFitPic(args, user, customer)
  }

  @Mutation()
  async reportFitPic(@Args() args, @User() user) {
    return this.fitPic.reportFitPic(args, user)
  }

  @Mutation()
  async updateFitPic(@Args() args) {
    return this.fitPic.updateFitPic(args)
  }

  @Mutation()
  async deleteFitPic(@Args() args) {
    return this.fitPic.deleteFitPic(args)
  }

  @Mutation()
  async updateFitPicReport(
    @Args() { id, data }: { id: string; data: FitPicReportUpdateInput }
  ) {
    await this.prisma.client.updateFitPicReport({
      data,
      where: { id },
    })
    return true
  }
}
