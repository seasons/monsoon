import { Injectable } from "@nestjs/common"
import RenderEmail from "@seasons/wind"
import sgMail from "@sendgrid/mail"
import { head } from "lodash"
import nodemailer from "nodemailer"

import {
  EmailId,
  ID_Input,
  Order,
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
} from "./email.utils.service"

type EmailUser = Pick<User, "email" | "firstName" | "id">

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
    availableStyles: Product[]
  ) {
    await this.sendEmailWithReservableStyles({
      user,
      availableStyles,
      renderEmailFunc: "authorized",
      emailId: "CompleteAccount",
      renderData: { version },
    })
  }

  async sendAuthorizedDaySevenFollowup(
    user: EmailUser,
    availableStyles: Product[]
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
    availableStyles: Product[],
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

  async sendRewaitlistedEmail(user: EmailUser, availableStyles: Product[]) {
    await this.sendEmailWithReservableStyles({
      user,
      availableStyles,
      renderEmailFunc: "rewaitlisted",
      emailId: "Rewaitlisted",
    })
  }

  async sendBuyUsedOrderConfirmationEmail(user: EmailUser, order: Order) {
    // Gather the appropriate product info
    const orderLineItems = await this.prisma.client
      .order({ id: order.id })
      .lineItems()
    const physicalProductId = orderLineItems.find(
      orderLineItem => orderLineItem.recordType === "PhysicalProduct"
    ).recordID
    const productId = (
      await this.prisma.client
        .physicalProduct({ id: physicalProductId })
        .productVariant()
        .product()
    ).id
    const products = await this.emailUtils.createGridPayload([
      { id: productId },
    ])

    // Grab the appropriate order info
    const formattedOrderLineItems = await this.emailUtils.formatOrderLineItems(
      order
    )
    const needsShipping = orderLineItems.reduce(
      (acc, curVal) => acc || curVal.needShipping,
      false
    )

    const custData = (
      await this.prisma.binding.query.customers(
        {
          where: { user: { id: user.id } },
        },
        `{
        detail {
          id
          shippingAddress {
            id
            name
            address1
            address2
            city
            state
            zipCode
          }
        }
        billingInfo {
          id
          brand
          last_digits
        }
      }`
      )
    )?.[0] as Customer

    // Render the email
    const payload = await RenderEmail.buyUsedOrderConfirmation({
      name: user.firstName,
      orderNumber: order.orderNumber,
      orderLineItems: formattedOrderLineItems,
      shipping: custData.detail.shippingAddress,
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
      id: referrer.id,
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
      id: user.id,
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
      id: user.id,
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "WelcomeToSeasons",
    })
  }

  async sendPausedEmail(customer: Customer, isExtension: boolean) {
    const latestPauseRequest = this.utils.getLatestPauseRequest(customer)

    const payload = await RenderEmail.paused({
      name: customer.user.firstName,
      isExtension,
      resumeDate: latestPauseRequest.resumeDate,
      id: customer.user.id,
    })

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
    returnedPhysicalProducts: PhysicalProduct[],
    reservation: Reservation
  ) {
    const payload = await RenderEmail.adminReservationReturnConfirmation({
      name: user.firstName,
      email: user.email,
      reservationNumber: reservation.reservationNumber,
      returnedItems: returnedPhysicalProducts.map(a => a.seasonsUID),
      id: user.id,
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
      id: user.id,
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
    reservation: PrismaReservation,
    trackingNumber?: string,
    trackingUrl?: string
  ) {
    const formattedProducts = await this.emailUtils.createGridPayload(products)

    const payload = await RenderEmail.reservationConfirmation({
      products: formattedProducts,
      orderNumber: reservation.reservationNumber,
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

  async sendReturnReminderEmail(
    user: EmailUser,
    reservation: PrismaReservation
  ) {
    const payload = await RenderEmail.returnReminder({
      name: user.firstName,
      returnDate: this.utils.getReservationReturnDate(reservation),
      id: user.id,
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "ReturnReminder",
    })
  }

  async sendYouCanNowReserveAgainEmail(user: EmailUser) {
    const payload = await RenderEmail.freeToReserve({ id: user.id })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "FreeToReserve",
    })
  }

  private async storeEmailReceipt(emailId: EmailId, userId: ID_Input) {
    await this.prisma.client.createEmailReceipt({
      emailId,
      user: { connect: { id: userId } },
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
  }: {
    user: EmailUser
    availableStyles: Product[]
    renderEmailFunc:
      | "authorized"
      | "authorizedDayThreeFollowup"
      | "authorizedDaySevenFollowup"
      | "rewaitlisted"
    emailId: EmailId
    renderData?: any
  }) {
    const products = await this.emailUtils.getXReservableProductsForUser(
      4,
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
    const u = await this.prisma.client.user({ email: to })
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
