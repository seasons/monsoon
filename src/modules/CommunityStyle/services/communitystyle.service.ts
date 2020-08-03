import { User } from "@app/decorators"
import { ImageService } from "@app/modules/Image"
import { PushNotificationService } from "@app/modules/PushNotification"
import { Injectable } from "@nestjs/common"
import { Args, Info } from "@nestjs/graphql"
import { StyleSubmission } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"

@Injectable()
export class CommunityStyleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService,
    private readonly pushNotificationService: PushNotificationService
  ) {}

  async submitStyle(@Args() { image }, @User() user) {
    const imageData = await this.imageService.uploadImage(image, {
      imageName: `${user.id}-${Date.now()}.jpg`,
    })

    const styleSubmission = await this.prisma.client.createStyleSubmission({
      user: {
        connect: { id: user.id },
      },
      image: {
        create: imageData,
      },
    })

    await this.prisma.client.updateUser({
      data: {
        styleSubmissions: { connect: [{ id: styleSubmission.id }] },
      },
      where: { id: user.id },
    })

    return true
  }

  async reportStyle(@Args() { id }: { id: string }, @User() user) {
    const style = this.prisma.client.styleSubmission({ id })
    if (!style) {
      throw new Error(`There exists no style with id ${id}`)
    }
    await this.prisma.client.createStyleSubmissionReport({
      reporter: { connect: { id: user.id } },
      reported: { connect: { id } },
    })
    return true
  }

  async approveStyle(@Args() { id }: { id: string }, approved: boolean) {
    // Update submission approval status and notify user
    const submitterEmail = await this.prisma.client
      .updateStyleSubmission({
        data: { approved },
        where: { id },
      })
      .user()
      .email()
    try {
      await this.pushNotificationService.pushNotifyUser({
        email: submitterEmail,
        pushNotifID: "Custom",
        vars: {
          title: "You've been featured!",
          body:
            "Your fit pic has been approved and is officially live. Tap to see it in the app.",
        },
      })
    } catch {
      // couldn't send push notif
    }
    return true
  }

  async deleteStyle(@Args() { id }: { id: string }) {
    await this.prisma.client.deleteManyStyleSubmissionReports({
      reported: { id },
    })
    await this.prisma.client.deleteStyleSubmission({ id })
    // delete image from s3?
    return true
  }

  async communityStyle(@Info() info): Promise<[StyleSubmission]> {
    return await this.prisma.binding.query.styleSubmissions(
      { where: { approved: true } },
      info
    )
  }

  async unapprovedStyleSubmissions(
    @Args() args,
    @Info() info
  ): Promise<[StyleSubmission]> {
    return await this.prisma.binding.query.styleSubmissions(
      { where: { approved: false, ...args.where } },
      info
    )
  }

  async communityStyleReports(
    @Args() args,
    @Info() info
  ): Promise<[StyleSubmission]> {
    return await this.prisma.binding.query.styleSubmissionReports(
      { where: args.where },
      info
    )
  }
}
