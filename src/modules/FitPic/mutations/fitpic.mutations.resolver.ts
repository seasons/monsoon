import { Customer, User } from "@app/decorators"
import { PrismaService } from "@modules/Prisma/prisma.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { Prisma } from "@prisma/client"

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
  async deleteFitPic(@Args() { id }: { id: string }) {
    await this.prisma.client2.fitPic.delete({ where: { id } })
    // delete image from s3?
    return true
  }

  @Mutation()
  async updateFitPicReport(
    @Args() { id, data }: { id: string; data: Prisma.FitPicReportUpdateInput }
  ) {
    await this.prisma.client2.fitPicReport.update({
      data,
      where: { id },
    })
    return true
  }
}
