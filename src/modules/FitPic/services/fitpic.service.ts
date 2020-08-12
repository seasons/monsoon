import { ImageService } from "@app/modules/Image"
import { IMGIX_BASE, S3_BASE } from "@app/modules/Image/services/image.service"
import { PushNotificationService } from "@app/modules/PushNotification"
import { ShippingUtilsService } from "@app/modules/Shipping/services/shipping.utils.service"
import { FitPicUpdateInput, LocationCreateOneInput } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import * as Sentry from "@sentry/node"

@Injectable()
export class FitPicService {
  constructor(
    private readonly image: ImageService,
    private readonly prisma: PrismaService,
    private readonly shippingUtils: ShippingUtilsService,
    private readonly pushNotification: PushNotificationService
  ) {}

  async submitFitPic({ image, location }, user, customer) {
    const imageData = await this.image.uploadImage(image, {
      imageName: `${user.id}-${Date.now()}.jpg`,
    })
    const imgixUrl = imageData.url.replace(S3_BASE, IMGIX_BASE)

    let fitPicLocation: LocationCreateOneInput
    if (location?.create?.zipCode) {
      if (location?.create?.city && location?.create?.state) {
        fitPicLocation = location
      } else {
        const detail = await this.shippingUtils.getCityAndStateFromZipCode(
          location.create.zipCode
        )
        fitPicLocation = {
          create: {
            zipCode: location.create.zipCode,
            city: detail.city,
            state: detail.state,
          },
        }
      }
    } else {
      const shippingAddress = await this.prisma.client
        .customer({ id: customer.id })
        .detail()
        .shippingAddress()
      location = {
        create: {
          zipCode: shippingAddress.zipCode,
          city: shippingAddress.city,
          state: shippingAddress.state,
        },
      }
    }

    const fitPic = await this.prisma.client.createFitPic({
      user: {
        connect: { id: user.id },
      },
      location,
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

    return fitPic.id
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
