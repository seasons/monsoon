import { Injectable } from "@nestjs/common"
import { Order } from "@prisma/client"
import RenderEmail from "@seasons/wind"
import sgMail from "@sendgrid/mail"
import { head } from "lodash"
import nodemailer from "nodemailer"

import {
  EmailId,
  ID_Input,
  Reservation as PrismaReservation,
  Product,
  User,
} from "../../../prisma"
import {
  Customer,
  DateTime,
  PhysicalProduct,
  Reservation,
} from "../../../prisma/prisma.binding"
import { PrismaService } from "../../../prisma/prisma.service"
import { UtilsService } from "../../Utils/services/utils.service"
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
    private readonly utils: UtilsService,
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

  async sendAuthorizedDaySevenFollowup(
    user: EmailUser,
    availableStyles: ProductWithEmailData[]
  ) {
    await this.sendEmailWithReservableStyles({
      user,
      availableStyles,
      renderEmailFunc: "authorizedDaySevenFollowup",
      emailId: "DaySevenAuthorizationFollowup",
    })
  }
  async sendAuthorizedDayThreeFollowup(
    user: EmailUser,
    availableStyles: ProductWithEmailData[],
    status: string = "Authorized"
  ) {
    await this.sendEmailWithReservableStyles({
      user,
      availableStyles,
      renderEmailFunc: "authorizedDayThreeFollowup",
      emailId: "DayThreeAuthorizationFollowup",
      renderData: { status },
    })
  }

  async sendAuthorizedDayTwoFollowup(user: EmailUser, status = "Authorized") {
    const payload = await RenderEmail.authorizedDayTwoFollowup({
      status,
      id: user.id,
    })
    await this.sendPreRenderedTransactionalEmail({
      user: user,
      payload,
      emailId: "DayTwoAuthorizationFollowup",
    })
  }

  async sendRewaitlistedEmail(
    user: EmailUser,
    availableStyles: ProductWithEmailData[]
  ) {
    await this.sendEmailWithReservableStyles({
      user,
      availableStyles,
      renderEmailFunc: "rewaitlisted",
      emailId: "Rewaitlisted",
    })
  }

  async sendBuyUsedOrderConfirmationEmail(user: EmailUser, order: Order) {
    // Gather the appropriate product info
    const orderWithLineItems = await this.prisma.client2.order.findUnique({
      where: { id: order.id },
      select: {
        lineItems: {
          select: { recordID: true, recordType: true, needShipping: true },
        },
      },
    })
    const orderLineItems = orderWithLineItems.lineItems
    const physicalProductId = orderLineItems.find(
      orderLineItem => orderLineItem.recordType === "PhysicalProduct"
    ).recordID
    const physicalProduct = this.prisma.sanitizePayload(
      await this.prisma.client2.physicalProduct.findUnique({
        where: { id: physicalProductId },
        select: {
          productVariant: { select: { product: { select: { id: true } } } },
          price: { select: { buyUsedPrice: true } },
        },
      }),
      "PhysicalProduct"
    )
    const productPrice = physicalProduct.price?.buyUsedPrice
    const productId = (physicalProduct.productVariant as any).product.id
    const products = await this.emailUtils.createGridPayload([
      { id: productId },
    ])
    products[0]["buyUsedPrice"] = productPrice

    // Grab the appropriate order info
    const formattedOrderLineItems = await this.emailUtils.formatOrderLineItems(
      order
    )
    const needsShipping = orderLineItems.reduce(
      (acc, curVal) => acc || curVal.needShipping,
      false
    )

    const _custData = await this.prisma.client2.customer.findFirst({
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
    const custData = this.prisma.sanitizePayload(_custData, "Customer")

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
    const cust = head(
      await this.prisma.binding.query.customers(
        {
          where: { user: { id: user.id } },
        },
        `
      {
        membership {
          plan {
            planID
            itemCount
          }
        }
      }
      `
      )
    ) as any
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

  async sendPausedEmail(customer: Customer, isExtension: boolean) {
    const latestPauseRequest = this.utils.getLatestPauseRequest(customer)
    const latestReservation = this.utils.getLatestReservation(customer)
    const withItems = latestPauseRequest.pauseType === "WithItems"
    let pausedWithItemsPrice
    if (withItems) {
      const planID = this.utils.getPauseWIthItemsPlanId(customer.membership)
      pausedWithItemsPrice = await this.prisma.client
        .paymentPlan({ planID })
        .price()
    }

    const data = {
      name: customer.user.firstName,
      resumeDate: latestPauseRequest.resumeDate,
      startDate: latestPauseRequest.pauseDate,
      hasOpenReservation:
        !!latestReservation &&
        !["Completed", "Cancelled"].includes(latestReservation.status),
      withItems,
      pausedWithItemsPrice,
      isExtension,
    }
    const payload = await RenderEmail.paused(data)

    await this.sendPreRenderedTransactionalEmail({
      user: customer.user,
      payload,
      emailId: "Paused",
    })
  }

  async sendResumeReminderEmail(user: EmailUser, resumeDate: DateTime) {
    await this.sendEmailWithLatestProducts({
      user,
      renderEmailFunc: "resumeReminder",
      emailId: "ResumeReminder",
      renderData: { resumeDate },
    })
  }

  async sendResumeConfirmationEmail(user: EmailUser) {
    await this.sendEmailWithLatestProducts({
      user,
      renderEmailFunc: "resumeConfirmation",
      emailId: "ResumeConfirmation",
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

  async sendReservationConfirmationEmail(
    user: EmailUser,
    products: Product[],
    reservation: { reservationNumber: number },
    trackingNumber?: string,
    trackingUrl?: string
  ) {
    const formattedProducts = await this.emailUtils.createGridPayload(products)

    const payload = await RenderEmail.reservationConfirmation({
      products: formattedProducts,
      orderNumber: `${reservation.reservationNumber}`,
      trackingNumber,
      trackingURL: trackingUrl,
      id: user.id,
    })
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

  async sendYouCanNowReserveAgainEmail(user: EmailUser) {
    const payload = await RenderEmail.freeToReserve()
    return await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "FreeToReserve",
    })
  }

  private async storeEmailReceipt(emailId: EmailId, userId: string) {
    return this.prisma.client2.emailReceipt.create({
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
      user as User,
      availableStyles
    )
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
      from: { email: "membership@seasons.nyc", name: "Seasons NYC" },
      to,
      bcc: "emails@seasons.nyc",
      subject: subject,
      html,
    }
    if (process.env.NODE_ENV === "production" || to.includes("seasons.nyc")) {
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
    const u = await this.prisma.client2.user.findUnique({
      where: { email: to },
      select: { sendSystemEmails: true },
    })
    return u.sendSystemEmails
  }

  private async addEmailedProductsToCustomer(
    user: EmailUser,
    products: MonsoonProductGridItem[]
  ) {
    const customer = head(
      await this.prisma.client.customers({ where: { user: { id: user.id } } })
    )
    await this.prisma.client.updateCustomer({
      where: { id: customer.id },
      data: {
        emailedProducts: {
          connect: products.map(a => ({ id: a.id })),
        },
      },
    })
  }
}
