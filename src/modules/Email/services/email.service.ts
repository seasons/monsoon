import { Injectable } from "@nestjs/common"
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
    const products = await this.emailUtils.getXLatestProducts(4)
    const payload = await RenderEmail.createdAccount({
      products,
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "SubmittedEmail",
    })
    await this.addEmailedProductsToCustomer(user, products)
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

  async sendAuthorized24HourFollowup(
    user: EmailUser,
    availableStyles: Product[]
  ) {
    await this.sendEmailWithReservableStyles({
      user,
      availableStyles,
      renderEmailFunc: "authorized24HourFollowup",
      emailId: "TwentyFourHourAuthorizationFollowup",
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

  async sendPausedEmail(customer: Customer) {
    const latestPauseRequest = head(
      customer.membership.pauseRequests.sort((a, b) =>
        this.utils.dateSort(a.createdAt, b.createdAt)
      )
    )
    const payload = await RenderEmail.paused({
      name: customer.user.firstName,
      resumeDate: latestPauseRequest.resumeDate,
    })

    await this.sendPreRenderedTransactionalEmail({
      user: customer.user,
      payload,
      emailId: "Paused",
    })
  }

  async sendResumeReminderEmail(user: EmailUser, resumeDate: DateTime) {
    const products = await this.emailUtils.getXLatestProducts(4)
    const payload = await RenderEmail.resumeReminder({
      name: user.firstName,
      resumeDate: resumeDate,
      products,
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "ResumeReminder",
    })
    await this.addEmailedProductsToCustomer(user, products)
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
    })
    await this.sendEmail({
      to: process.env.OPERATIONS_ADMIN_EMAIL,
      subject: payload.subject,
      html: payload.body,
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
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "ReturnReminder",
    })
  }

  async sendYouCanNowReserveAgainEmail(user: EmailUser) {
    const payload = await RenderEmail.freeToReserve({})
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

  private async sendEmailWithReservableStyles({
    user,
    availableStyles,
    renderEmailFunc,
    emailId,
    renderData = {},
  }: {
    user: EmailUser
    availableStyles: Product[]
    renderEmailFunc: "authorized" | "authorized24HourFollowup" | "rewaitlisted"
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
      ...renderData,
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId,
    })
    if (products !== null) {
      await this.addEmailedProductsToCustomer(user, products)
    }
  }

  private async sendPreRenderedTransactionalEmail({
    user,
    payload: { body, subject },
    emailId,
  }: {
    user: EmailUser
    payload: { body: string; subject: string }
    emailId: EmailId
  }) {
    await this.sendEmail({
      to: user.email,
      subject: subject,
      html: body,
    })
    await this.storeEmailReceipt(emailId, user.id)
  }

  private async sendEmail({ to, subject, html }) {
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
    } else if (process.env.NODE_ENV !== "test") {
      await nodemailerTransport.sendMail({
        from: "membership@seasons.nyc",
        ...msg,
      })
    }
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
