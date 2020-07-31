import { User } from "@app/decorators"
import { ImageService } from "@app/modules/Image"
import { Upload } from "@app/modules/Image/models/Upload.model"
import { PushNotificationService } from "@app/modules/PushNotification"
import { Injectable } from "@nestjs/common"
import { Args, Info } from "@nestjs/graphql"
import { StyleSubmission, UserWhereUniqueInput } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"

@Injectable()
export class CommunityStyleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService,
    private readonly pushNotificationService: PushNotificationService
  ) {}

  async submitStyle(
    @Args("image") image: Upload,
    @User() user: UserWhereUniqueInput,
    @Info() info
  ): Promise<[StyleSubmission]> {
    console.log("Got data:", image)
    const imageData = await this.imageService.uploadImage(image, {})

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
      where: user,
    })

    return this.communityStyle(info)
  }

  async reportStyle(
    @Args("id") id: string,
    @User() user: UserWhereUniqueInput
  ) {
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

  async approveStyle(@Args("id") id: string, approved: boolean) {
    // Update submission approval status and notify user
    const submitterEmail = await this.prisma.client
      .updateStyleSubmission({
        data: { approved },
        where: { id },
      })
      .user()
      .email()
    await this.pushNotificationService.pushNotifyUser({
      email: submitterEmail,
      pushNotifID: "Custom",
      vars: {
        title: "You've been featured!",
        body:
          "Your fit pic has been approved and is officially live. Tap to see it in the app.",
      },
    })
    return true
  }

  async deleteStyle(@Args("id") id: string) {
    await this.prisma.client.deleteManyStyleSubmissionReports({
      reported: { id },
    })
    await this.prisma.client.deleteStyleSubmission({ id })
    return true
  }

  async communityStyle(@Info() info): Promise<[StyleSubmission]> {
    return await this.prisma.binding.query.styleSubmissions(
      { where: { approved: true } },
      info
    )
  }
}
