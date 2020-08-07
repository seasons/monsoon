import { ImageService } from "@app/modules/Image"
import { IMGIX_BASE, S3_BASE } from "@app/modules/Image/services/image.service"
import { PushNotificationService } from "@app/modules/PushNotification"
import { FitPicUpdateInput } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import * as Sentry from "@sentry/node"

@Injectable()
export class FitPicService {
  constructor(
    private readonly image: ImageService,
    private readonly prisma: PrismaService,
    private readonly pushNotification: PushNotificationService
  ) {}

  async submitFitPic({ image }, user) {
    const imageData = await this.image.uploadImage(image, {
      imageName: `${user.id}-${Date.now()}.jpg`,
    })
    const imgixUrl = imageData.url.replace(S3_BASE, IMGIX_BASE)

    const fitPic = await this.prisma.client.createFitPic({
      user: {
        connect: { id: user.id },
      },
      image: {
        // override the imageData url with the imgixUrl
        create: { ...imageData, url: imgixUrl },
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

  async reportFitPic({ id }: { id: string }, user) {
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

  async updateFitPic({ id, data }: { id: string; data: FitPicUpdateInput }) {
    const wasApproved = await this.prisma.client.fitPic({ id }).approved()

    // update fit pic and get submitter email
    const submitterEmail = await this.prisma.client
      .updateFitPic({
        data,
        where: { id },
      })
      .user()
      .email()

    // notify user if they were just approved
    if (!wasApproved && data.approved) {
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

  async deleteFitPic({ id }: { id: string }) {
    await this.prisma.client.deleteManyFitPicReports({
      reported: { id },
    })
    await this.prisma.client.deleteFitPic({ id })
    // delete image from s3?
    return true
  }

  async publicFitPics(args, info) {
    const approvedFitPics = await this.prisma.binding.query.fitPics(
      // override any `approved` flags
      { ...args, where: { ...args.where, approved: true } },
      // although author isn't defined on FitPic, it will be ignored
      info
    )
    return approvedFitPics.map(
      ({ id, user, image, location, products, createdAt, updatedAt }) => ({
        id,
        author: user && `${user.firstName} ${user.lastName}`,
        image,
        location,
        products,
        createdAt,
        updatedAt,
      })
    )
  }
}
