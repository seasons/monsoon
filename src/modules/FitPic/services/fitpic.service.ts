import { ImageService } from "@app/modules/Image"
import { IMGIX_BASE, S3_BASE } from "@app/modules/Image/services/image.service"
import { PushNotificationService } from "@app/modules/PushNotification"
import { ShippingUtilsService } from "@app/modules/Shipping/services/shipping.utils.service"
import {
  Customer,
  FitPicUpdateInput,
  LocationCreateOneInput,
  User,
} from "@app/prisma"
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

  async submitFitPic(
    { image, location }: { image: any; location: LocationCreateOneInput },
    user: User,
    customer: Customer
  ) {
    const imageData = await this.image.uploadImage(image, {
      imageName: `${user.id}-${Date.now()}.jpg`,
    })
    const imgixUrl = imageData.url.replace(S3_BASE, IMGIX_BASE)

    const fitPic = await this.prisma.client.createFitPic({
      user: {
        connect: { id: user.id },
      },
      location: await this.getLocation({ location, forCustomer: customer }),
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

  async reportFitPic({ id }: { id: string }, user: User) {
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
    const oldStatus = await this.prisma.client.fitPic({ id }).status()

    // update fit pic and get submitter email
    const submitterEmail = await this.prisma.client
      .updateFitPic({
        data,
        where: { id },
      })
      .user()
      .email()

    // notify user if they were just approved for the first time
    if (oldStatus === "Submitted" && data.status === "Published") {
      try {
        await this.pushNotification.pushNotifyUser({
          email: submitterEmail,
          pushNotifID: "PublishFitPic",
        })
      } catch (error) {
        Sentry.captureException(error)
      }
    }

    return true
  }

  private async getLocation({
    location,
    forCustomer,
  }: {
    location?: LocationCreateOneInput
    forCustomer: Customer
  }) {
    if (
      location?.create?.zipCode &&
      location?.create?.city &&
      location?.create?.state
    ) {
      return location
    } else if (location?.create?.zipCode) {
      const detail = await this.shippingUtils.getCityAndStateFromZipCode(
        location.create.zipCode
      )
      return {
        create: {
          zipCode: location.create.zipCode,
          city: detail.city,
          state: detail.state,
        },
      }
    } else {
      const shippingAddress = await this.prisma.client
        .customer({ id: forCustomer.id })
        .detail()
        .shippingAddress()
      if (shippingAddress.city && shippingAddress.state) {
        return {
          create: {
            zipCode: shippingAddress.zipCode,
            city: shippingAddress.city,
            state: shippingAddress.state,
          },
        }
      } else {
        return null
      }
    }
  }
}
