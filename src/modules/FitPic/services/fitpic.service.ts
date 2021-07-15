import {
  IMGIX_BASE,
  ImageService,
  S3_BASE,
} from "@app/modules/Image/services/image.service"
import { PushNotificationService } from "@app/modules/PushNotification"
import { Customer, User } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import * as Sentry from "@sentry/node"
import zipcodes from "zipcodes"

@Injectable()
export class FitPicService {
  constructor(
    private readonly image: ImageService,
    private readonly prisma: PrismaService,
    private readonly pushNotification: PushNotificationService
  ) {}

  async submitFitPic(
    {
      image,
      location,
      options = {},
    }: {
      image: any
      location: {
        create: Prisma.LocationCreateInput
      }
      options: {
        instagramHandle?: string
        includeInstagramHandle?: boolean
      }
    },
    user: User,
    customer: Customer
  ) {
    const { instagramHandle, includeInstagramHandle } = options
    const imageData = await this.image.uploadImage(image, {
      imageName: `${user.id}-${Date.now()}.jpg`,
    })
    const imgixUrl = imageData.url.replace(S3_BASE, IMGIX_BASE)

    const fitPic = await this.prisma.client2.fitPic.create({
      data: {
        user: {
          connect: { id: user.id },
        },
        location: await this.getLocation({ location, forCustomer: customer }),
        image: {
          // override the imageData url with the imgixUrl
          create: { ...imageData, url: imgixUrl },
        },
        products: { create: [] },
        includeInstagramHandle,
      },
    })

    await this.prisma.client2.user.update({
      data: {
        fitPics: { connect: [{ id: fitPic.id }] },
      },
      where: { id: user.id },
    })

    if (!!instagramHandle) {
      await this.updateCustomerInstagramHandle({ instagramHandle, customer })
    }

    return fitPic.id
  }

  async reportFitPic({ id }: { id: string }, user: User) {
    const fitPic = await this.prisma.client2.fitPic.findFirst({
      where: {
        id,
      },
    })
    if (!fitPic) {
      throw new Error(`There exists no fit pic with id ${id}`)
    }
    await this.prisma.client2.fitPicReport.create({
      data: {
        reporter: { connect: { id: user.id } },
        reported: { connect: { id } },
      },
    })
    return true
  }

  async updateFitPic({
    id,
    data,
  }: {
    id: string
    data: Prisma.FitPicUpdateInput
  }) {
    // FitPicUpdateInput
    const oldStatus = (
      await this.prisma.client2.fitPic.findFirst({
        where: {
          id,
        },
      })
    ).status

    // update fit pic and get submitter email
    const submitter = await this.prisma.client2.fitPic.update({
      data,
      where: { id },
      select: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })
    const submitterEmail = submitter.user.email

    // notify user if they were just approved for the first time
    if (oldStatus === "Submitted" && data.status === "Published") {
      try {
        await this.pushNotification.pushNotifyUsers({
          emails: [submitterEmail],
          pushNotifID: "PublishFitPic",
        })
      } catch (error) {
        Sentry.captureException(error)
      }
    }

    return true
  }

  private async updateCustomerInstagramHandle({
    instagramHandle,
    customer,
  }: {
    instagramHandle: string
    customer: Customer
  }) {
    const customerDetail = await this.prisma.client2.customer.findFirst({
      where: { id: customer.id },
      select: {
        detailId: true,
      },
    })
    const customerDetailID = customerDetail.detailId

    return await this.prisma.client2.customerDetail.update({
      data: { instagramHandle },
      where: { id: customerDetailID },
    })
  }

  private async getLocation({
    location,
    forCustomer,
  }: {
    location?: {
      create: Prisma.LocationCreateInput
    }
    forCustomer: Customer
  }) {
    if (
      location?.create?.zipCode &&
      location?.create?.city &&
      location?.create?.state
    ) {
      return location
    } else if (location?.create?.zipCode) {
      const zipCode = location.create.zipCode
      const state = zipcodes.lookup(zipCode)?.state
      const city = zipcodes.lookup(zipCode)?.city
      return {
        create: {
          zipCode: location.create.zipCode,
          city,
          state,
        },
      }
    } else {
      const customer = await this.prisma.client2.customer.findUnique({
        where: { id: forCustomer.id },
        select: {
          detail: {
            select: {
              id: true,
              shippingAddress: true,
            },
          },
        },
      })
      const shippingAddress = customer.detail.shippingAddress
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
