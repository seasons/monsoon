import { ShippingMethodFieldsResolver } from "@app/modules/Shipping/fields/shippingMethod.fields.resolver"
import { Injectable } from "@nestjs/common"
import { Order, ShippingCode } from "@prisma/client"
import RenderEmail from "@seasons/wind"
import sgMail from "@sendgrid/mail"
import { DateTime } from "luxon"
import nodemailer from "nodemailer"

import { EmailId, User } from "../../../prisma"
import { PrismaService } from "../../../prisma/prisma.service"
import {
  EmailUtilsService,
  MonsoonProductGridItem,
  ProductWithEmailData,
} from "./email.utils.service"

export type EmailUser = Pick<User, "email" | "firstName" | "id">

@Injectable()
export class EmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailUtils: EmailUtilsService
  ) {}

  async sendSubmittedEmailEmail(user: EmailUser) {
    await this.sendEmailWithLatestProducts({
      user,
      renderEmailFunc: "createdAccount",
      emailId: "SubmittedEmail",
    })
  }

  async sendAuthorizedEmail(
    user: EmailUser,
    version: "manual" | "automatic",
    availableStyles: ProductWithEmailData[]
  ) {
    await this.sendEmailWithReservableStyles({
      user,
      availableStyles,
      renderEmailFunc: "authorized",
      emailId: "CompleteAccount",
      renderData: { version },
    })
  }

  async sendRecommendedItemsNurtureEmail(
    user: EmailUser,
    availableStyles: ProductWithEmailData[]
  ) {
    await this.sendEmailWithReservableStyles({
      user,
      availableStyles,
      renderEmailFunc: "recommendedItemsNurture",
      emailId: "RecommendedItemsNurture",
      numStylesToSend: 5,
    })
  }

  async sendAuthorizedDayTwoFollowup(user: EmailUser, status = "Authorized") {
    const payload = await RenderEmail.authorizedDayTwoFollowup({
      id: user.id,
    })
    await this.sendPreRenderedTransactionalEmail({
      user: user,
      payload,
      emailId: "DayTwoAuthorizationFollowup",
    })
  }

  async sendBuyUsedOrderConfirmationEmail(
    user: EmailUser,
    order: Pick<Order, "id" | "orderNumber">
  ) {
    // Gather the appropriate product info
    const orderWithLineItems = await this.prisma.client.order.findUnique({
      where: { id: order.id },
      select: {
        lineItems: {
          select: {
            recordID: true,
            recordType: true,
            needShipping: true,
            price: true,
          },
        },
      },
    })
    const orderLineItems = orderWithLineItems.lineItems
    const physicalProductIds = orderLineItems
      .filter(orderLineItem => orderLineItem.recordType === "PhysicalProduct")
      .map(a => a.recordID)
    const physicalProducts = await this.prisma.client.physicalProduct.findMany({
      where: { id: { in: physicalProductIds } },
      select: {
        id: true,
        productVariant: {
          select: { product: { select: { id: true } }, displayShort: true },
        },
        price: { select: { buyUsedPrice: true } },
      },
    })
    let products = await this.emailUtils.createGridPayload(
      physicalProducts.map(a => ({
        id: a.productVariant.product.id,
      }))
    )
    products = products.map(p => {
      const physicalProduct = physicalProducts.find(
        a => a.productVariant.product.id === p.id
      )
      const orderLineItem = orderLineItems.find(
        a => a.recordID === physicalProduct.id
      )
      return {
        ...p,
        buyUsedPrice: orderLineItem.price,
        variantSize: physicalProduct.productVariant.displayShort,
      }
    })

    // Grab the appropriate order info
    const formattedOrderLineItems = await this.emailUtils.formatOrderLineItems(
      order
    )
    const needsShipping = orderLineItems.reduce(
      (acc, curVal) => acc || curVal.needShipping,
      false
    )

    const custData = await this.prisma.client.customer.findFirst({
      where: { user: { id: user.id } },
      select: {
        id: true,
        detail: {
          select: {
            id: true,
            shippingAddress: {
              select: {
                id: true,
                name: true,
                address1: true,
                address2: true,
                city: true,
                state: true,
                zipCode: true,
              },
            },
          },
        },
        billingInfo: { select: { id: true, brand: true, last_digits: true } },
      },
    })

    // Render the email
    const payload = await RenderEmail.buyUsedOrderConfirmation({
      name: user.firstName,
      orderNumber: order.orderNumber,
      orderLineItems: formattedOrderLineItems,
      shipping: custData.detail.shippingAddress as any,
      cardInfo: custData.billingInfo,
      products,
      needsShipping,
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "BuyUsedOrderConfirmation",
    })
  }

  async sendOrderProcessedEmail(
    user: EmailUser,
    order: Pick<Order, "id" | "orderNumber">,
    trackingInfo: {
      trackingNumber: string
      trackingURL: string
    }
  ) {
    // Gather the appropriate product info
    const orderWithLineItems = await this.prisma.client.order.findUnique({
      where: { id: order.id },
      select: {
        lineItems: {
          select: {
            recordID: true,
            recordType: true,
            needShipping: true,
            price: true,
          },
        },
      },
    })
    const orderLineItems = orderWithLineItems.lineItems
    const physicalProductIds = orderLineItems
      .filter(orderLineItem => orderLineItem.recordType === "PhysicalProduct")
      .map(a => a.recordID)
    const physicalProducts = await this.prisma.client.physicalProduct.findMany({
      where: { id: { in: physicalProductIds } },
      select: {
        id: true,
        productVariant: {
          select: { product: { select: { id: true } }, displayShort: true },
        },
        price: { select: { buyUsedPrice: true } },
      },
    })
    let products = await this.emailUtils.createGridPayload(
      physicalProducts.map(a => ({
        id: a.productVariant.product.id,
      }))
    )
    products = products.map(p => {
      const physicalProduct = physicalProducts.find(
        a => a.productVariant.product.id === p.id
      )
      const orderLineItem = orderLineItems.find(
        a => a.recordID === physicalProduct.id
      )
      return {
        ...p,
        buyUsedPrice: orderLineItem.price,
        variantSize: physicalProduct.productVariant.displayShort,
      }
    })

    const custData = await this.prisma.client.customer.findFirst({
      where: { user: { id: user.id } },
      select: {
        id: true,
        detail: {
          select: {
            id: true,
            shippingAddress: {
              select: {
                id: true,
                name: true,
                address1: true,
                address2: true,
                city: true,
                state: true,
                zipCode: true,
              },
            },
          },
        },
        billingInfo: { select: { id: true, brand: true, last_digits: true } },
      },
    })

    const formattedOrderLineItems = await this.emailUtils.formatOrderLineItems(
      order
    )

    const payload = await RenderEmail.orderProcessed({
      name: user.firstName,
      orderNumber: order.orderNumber,
      orderLineItems: formattedOrderLineItems,
      shipping: custData.detail.shippingAddress as any,
      products,
      ...trackingInfo,
    })
    await this.sendPreRenderedTransactionalEmail({
      user: user,
      payload,
      emailId: "OrderProcessed",
    })
  }

  async sendUnpaidMembershipEmail(user: EmailUser) {
    const payload = await RenderEmail.unpaidMembership({ name: user.firstName })
    await this.sendPreRenderedTransactionalEmail({
      user: user,
      payload,
      emailId: "UnpaidMembership",
    })
  }

  async sendReturnToGoodStandingEmail(user: EmailUser) {
    const payload = await RenderEmail.returnToGoodStanding({
      name: user.firstName,
    })
    await this.sendPreRenderedTransactionalEmail({
      user: user,
      payload,
      emailId: "ReturnToGoodStanding",
    })
  }

  async sendReferralConfirmationEmail({
    referrer,
    referee,
  }: {
    referrer: EmailUser
    referee: EmailUser
  }) {
    const payload = await RenderEmail.referralConfirmation({
      referrerName: referrer.firstName,
      refereeName: `${referee.firstName}`,
    })
    await this.sendPreRenderedTransactionalEmail({
      user: referrer,
      payload,
      emailId: "ReferralConfirmation",
    })
  }

  async sendWaitlistedEmail(user: EmailUser) {
    const payload = await RenderEmail.waitlisted({
      name: user.firstName,
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "Waitlisted",
    })
  }

  async sendSubscribedEmail(user: EmailUser) {
    const cust = await this.prisma.client.customer.findFirst({
      where: { user: { id: user.id } },
      select: {
        membership: {
          select: { plan: { select: { planID: true, itemCount: true } } },
        },
      },
    })
    const payload = await RenderEmail.subscribed({
      name: user.firstName,
      planId: cust.membership?.plan?.planID,
      itemCount: `${cust.membership?.plan?.itemCount}`,
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "WelcomeToSeasons",
    })
  }

  async sendAdminConfirmationEmail(
    user: EmailUser,
    returnedPhysicalProducts: { seasonsUID: string }[],
    reservation: { reservationNumber: number }
  ) {
    const payload = await RenderEmail.adminReservationReturnConfirmation({
      name: user.firstName,
      email: user.email,
      reservationNumber: `${reservation.reservationNumber}`,
      returnedItems: returnedPhysicalProducts.map(a => a.seasonsUID),
    })
    await this.sendEmail({
      to: process.env.OPERATIONS_ADMIN_EMAIL,
      subject: payload.subject,
      html: payload.body,
      type: payload.type,
    })
  }

  async sendPriorityAccessEmail(user: EmailUser) {
    const payload = await RenderEmail.priorityAccess({
      name: user.firstName,
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "PriorityAccess",
    })
  }

  async sendReservationProcessedEmail(data: {
    user: EmailUser
    reservation: {
      id: string
    }
    outboundPackage?: {
      shippingLabel?: {
        trackingNumber: string
        trackingURL: string
      }
    }
    shippingCode: ShippingCode
  }) {
    const reservation = await this.prisma.client.reservation.findFirst({
      where: {
        id: data.reservation.id,
      },
      select: {
        shippingMethod: true,
        pickupDate: true,
        pickupWindowId: true,
        reservationNumber: true,
      },
    })
    const shippingLabel = data.outboundPackage.shippingLabel
    const extraData =
      data.shippingCode === ShippingCode.Pickup
        ? {
            pickup: {
              date: reservation.pickupDate,
              timeRange: ShippingMethodFieldsResolver.getTimeWindow(
                reservation.pickupWindowId
              )?.display,
            },
          }
        : !!shippingLabel
        ? {
            trackingNumber: shippingLabel.trackingNumber,
            trackingURL: shippingLabel.trackingURL,
          }
        : {}

    const payload = await RenderEmail.reservationProcessed({
      ...extraData,
      customerWillPickup: data.shippingCode === ShippingCode.Pickup,
      orderNumber: `${reservation.reservationNumber}`,
    })

    const { user } = data

    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "ReservationProcessed",
      ...extraData,
    })
  }

  async sendReservationConfirmationEmail({
    user,
    productsVariantIDs,
    reservation,
  }: {
    user: EmailUser
    productsVariantIDs: string[]
    reservation: { reservationNumber: number }
  }) {
    const gridPayload = await this.emailUtils.createGridPayloadWithProductVariants(
      productsVariantIDs
    )

    const data = {
      products: gridPayload,
      orderNumber: `${reservation.reservationNumber}`,
      id: user.id,
    }

    const payload = await RenderEmail.reservationConfirmation(data)
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "ReservationConfirmation",
    })
  }

  async sendReturnReminderEmail(user: EmailUser) {
    const payload = await RenderEmail.returnReminder({
      name: user.firstName,
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "ReturnReminder",
    })
  }

  async sendRestockNotificationEmails(emails: string[], product) {
    const payload = await RenderEmail.restockNotification({
      products: [await this.emailUtils.productToGridPayload(product)],
    })

    const users = await this.prisma.client.user.findMany({
      where: {
        email: { in: emails },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    })

    for (const user of users) {
      await this.sendPreRenderedTransactionalEmail({
        user,
        payload,
        emailId: "RestockNotification",
      })
    }
  }

  async sendYouCanNowReserveAgainEmail(user: EmailUser) {
    const payload = await RenderEmail.freeToReserve({
      products: [],
    })
    return await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "FreeToReserve",
    })
  }

  private async storeEmailReceipt(emailId: EmailId, userId: string) {
    return this.prisma.client.emailReceipt.create({
      data: {
        emailId,
        user: { connect: { id: userId } },
      },
    })
  }

  private async sendEmailWithLatestProducts({
    user,
    renderEmailFunc,
    emailId,
    renderData = {},
  }: {
    user: EmailUser
    renderEmailFunc: "createdAccount" | "resumeReminder" | "resumeConfirmation"
    emailId: EmailId
    renderData?: any
  }) {
    const products = await this.emailUtils.getXLatestProducts(4)
    const payload = await RenderEmail[renderEmailFunc]({
      name: `${user.firstName}`,
      products,
      id: user.id,
      ...renderData,
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId,
    })
    await this.addEmailedProductsToCustomer(user, products)
  }

  private async sendEmailWithReservableStyles({
    user,
    availableStyles,
    renderEmailFunc,
    emailId,
    renderData = {},
    numStylesToSend = 4,
  }: {
    user: EmailUser
    availableStyles: ProductWithEmailData[]
    renderEmailFunc:
      | "authorized"
      | "authorizedDayThreeFollowup"
      | "authorizedDaySevenFollowup"
      | "rewaitlisted"
      | "recommendedItemsNurture"
    emailId: EmailId
    renderData?: any
    numStylesToSend?: number
  }) {
    const products = await this.emailUtils.getXReservableProductsForUser(
      numStylesToSend,
      user,
      availableStyles
    )
    if (
      products.length === 0 &&
      renderEmailFunc === "recommendedItemsNurture"
    ) {
      return
    }
    const payload = await RenderEmail[renderEmailFunc]({
      name: `${user.firstName}`,
      products,
      id: user.id,
      ...renderData,
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId,
    })
    if (products?.length > 0) {
      await this.addEmailedProductsToCustomer(user, products)
    }
  }

  private async sendPreRenderedTransactionalEmail({
    user,
    payload: { body, subject, type },
    emailId,
  }: {
    user: EmailUser
    payload: { body: string; subject: string; type: "essential" | "marketing" }
    emailId: EmailId
  }) {
    const storeReceipt = await this.sendEmail({
      to: user.email,
      subject: subject,
      html: body,
      type,
    })
    if (storeReceipt) {
      await this.storeEmailReceipt(emailId, user.id)
    }

    return storeReceipt
  }

  // returns true if it sent the email, false otherwise
  private async sendEmail({ to, subject, html, type }) {
    const shouldSendEmail = await this.shouldSendEmail({ to, type })
    if (!shouldSendEmail) {
      return false
    }

    const nodemailerTransport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "7b3330ee47f7b2",
        pass: "e81e7c28792bfa",
      },
    })

    const msg = {
      from: { email: "membership@seasons.nyc", name: "Seasons" },
      to,
      bcc: "emails@seasons.nyc",
      subject: subject,
      html,
    }

    if (process.env.NODE_ENV === "production") {
      sgMail.send(msg)
    } else {
      await nodemailerTransport.sendMail({
        from: "membership@seasons.nyc",
        ...msg,
      })
    }

    return true
  }

  private async shouldSendEmail({ to, type }) {
    if (to === process.env.OPERATIONS_ADMIN_EMAIL) {
      return true
    }
    if (type === "essential") {
      return true
    }
    const u = await this.prisma.client.user.findUnique({
      where: { email: to },
      select: { sendSystemEmails: true },
    })
    return u.sendSystemEmails
  }

  private async addEmailedProductsToCustomer(
    user: EmailUser,
    products: MonsoonProductGridItem[]
  ) {
    const customer = await this.prisma.client.customer.findFirst({
      where: { user: { id: user.id } },
      select: { id: true },
    })
    await this.prisma.client.customer.update({
      where: { id: customer.id },
      data: {
        emailedProducts: {
          connect: products.map(a => ({ id: a.id })),
        },
      },
    })
  }
}
