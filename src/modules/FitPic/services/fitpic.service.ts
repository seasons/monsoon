import { User } from "@app/decorators"
import { hasRole } from "@app/directives/hasRole"
import { ImageService } from "@app/modules/Image"
import { PushNotificationService } from "@app/modules/PushNotification"
import { UserRole } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { Args, Context, Info } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
import * as Sentry from "@sentry/node"

@Injectable()
export class FitPicService {
  constructor(
    private readonly image: ImageService,
    private readonly prisma: PrismaService,
    private readonly pushNotification: PushNotificationService
  ) {}

  private async isAdmin(@Context() ctx) {
    try {
      const adminRole: UserRole = "Admin"
      // tslint:disable-next-line: no-empty
      await hasRole(() => {}, null, { roles: [adminRole] }, ctx)
      return true
    } catch {
      return false
    }
  }

  async submitFitPic(@Args() { image }, @User() user) {
    const imageData = await this.image.uploadImage(image, {
      imageName: `${user.id}-${Date.now()}.jpg`,
    })

    const fitPic = await this.prisma.client.createFitPic({
      user: {
        connect: { id: user.id },
      },
      image: {
        create: imageData,
      },
    })

    await this.prisma.client.updateUser({
      data: {
        fitPics: { connect: [{ id: fitPic.id }] },
      },
      where: { id: user.id },
    })

    return true
  }

  async reportFitPic(@Args() { id }: { id: string }, @User() user) {
    const fitPic = this.prisma.client.fitPic({ id })
    if (!fitPic) {
      throw new Error(`There exists no fit pic with id ${id}`)
    }
    await this.prisma.client.createFitPicReport({
      reporter: { connect: { id: user.id } },
      reported: { connect: { id } },
    })
    return true
  }

  async updateFitPicApproved(
    @Args() { id, approved }: { id: string; approved: boolean }
  ) {
    // Update submission approval status and get submitter email
    const submitterEmail = await this.prisma.client
      .updateFitPic({
        data: { approved },
        where: { id },
      })
      .user()
      .email()

    // notify user if they were just approved
    if (approved) {
      try {
        await this.pushNotification.pushNotifyUser({
          email: submitterEmail,
          pushNotifID: "ApproveFitPic",
        })
      } catch (error) {
        Sentry.captureException(error)
      }
    }

    return true
  }

  async deleteFitPic(@Args() { id }: { id: string }) {
    await this.prisma.client.deleteManyFitPicReports({
      reported: { id },
    })
    await this.prisma.client.deleteFitPic({ id })
    // delete image from s3?
    return true
  }

  async fitPics(@Args() args, @Info() info, @Context() ctx) {
    // if not admin, return the approved fit pics only
    return (await this.isAdmin(ctx))
      ? await this.prisma.binding.query.fitPics(args, info)
      : await this.prisma.binding.query.fitPics(
          { ...args, where: { ...args.where, approved: true } },
          info
        )
  }
}
