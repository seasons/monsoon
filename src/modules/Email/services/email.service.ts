import fs from "fs"

import { Injectable } from "@nestjs/common"
import RenderEmail from "@seasons/wind"
import sgMail from "@sendgrid/mail"
import Handlebars from "handlebars"
import { head } from "lodash"
import nodemailer from "nodemailer"

import {
  EmailId,
  ID_Input,
  Reservation as PrismaReservation,
  Product,
  User,
} from "../../../prisma"
import { Customer, DateTime, Reservation } from "../../../prisma/prisma.binding"
import { PrismaService } from "../../../prisma/prisma.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { EmailDataProvider } from "./email.data.service"
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
    private readonly data: EmailDataProvider,
    private readonly emailUtils: EmailUtilsService
  ) {}

  async sendSubmittedEmailEmail(user: EmailUser) {
    const fourLatestProducts = await this.emailUtils.getXLatestProducts(4)
    const payload = await RenderEmail.createdAccount({
      ...this.formatProductGridInput(fourLatestProducts),
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "SubmittedEmail",
    })
    await this.addEmailedProductsToCustomer(user, fourLatestProducts)
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
    const fourLatestProducts = await this.emailUtils.getXLatestProducts(4)
    const payload = await RenderEmail.resumeReminder({
      name: user.firstName,
      resumeDate: resumeDate,
      ...this.formatProductGridInput(fourLatestProducts),
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId: "ResumeReminder",
    })
    await this.addEmailedProductsToCustomer(user, fourLatestProducts)
  }

  async sendAdminConfirmationEmail(
    user: EmailUser,
    products: any[],
    reservation: Reservation
  ) {
    await this.sendTransactionalEmail({
      to: process.env.OPERATIONS_ADMIN_EMAIL,
      data: this.data.reservationReturnConfirmation(
        reservation.reservationNumber,
        products.map(p => p.seasonsUID),
        user.email
      ),
    })
    await this.storeEmailReceipt("ReservationReturnConfirmation", user.id)
  }

  async sendPriorityAccessEmail(user: EmailUser) {
    await this.sendTransactionalEmail({
      to: user.email,
      data: this.data.priorityAccess({ name: user.firstName }),
    })
    await this.storeEmailReceipt("PriorityAccess", user.id)
  }

  async sendReservationConfirmationEmail(
    user: EmailUser,
    products: Product[],
    reservation: PrismaReservation,
    trackingNumber?: string,
    trackingUrl?: string
  ) {
    const reservedItems = [
      await this.getReservationConfirmationDataForProduct(products[0]),
    ]
    if (!!products?.[1]) {
      reservedItems.push(
        await this.getReservationConfirmationDataForProduct(products[1])
      )
    }
    if (!!products?.[2]) {
      reservedItems.push(
        await this.getReservationConfirmationDataForProduct(products[2])
      )
    }

    await this.sendTransactionalEmail({
      to: user.email,
      data: this.data.reservationConfirmation(
        reservation.reservationNumber,
        reservedItems,
        this.utils.formatReservationReturnDate(new Date(reservation.createdAt)),
        trackingNumber,
        trackingUrl
      ),
    })
    await this.storeEmailReceipt("ReservationConfirmation", user.id)
  }

  async sendReturnReminderEmail(
    user: EmailUser,
    reservation: PrismaReservation
  ) {
    await this.sendTransactionalEmail({
      to: user.email,
      data: this.data.returnReminder({
        name: user.firstName,
        returnDate: this.utils.formatReservationReturnDate(
          new Date(reservation.createdAt)
        ),
      }),
    })
    await this.storeEmailReceipt("ReturnReminder", user.id)
  }

  async sendYouCanNowReserveAgainEmail(user: EmailUser) {
    await this.sendTransactionalEmail({
      to: user.email,
      data: this.data.freeToReserve(),
    })
    await this.storeEmailReceipt("FreeToReserve", user.id)
  }

  private async storeEmailReceipt(emailId: EmailId, userId: ID_Input) {
    await this.prisma.client.createEmailReceipt({
      emailId,
      user: { connect: { id: userId } },
    })
  }

  private getReservationConfirmationDataForProduct = async (
    product: Product
  ) => {
    const images = await this.prisma.client.product({ id: product.id }).images()
    return {
      url: images?.[0]?.url,
      brand: await this.prisma.client
        .product({ id: product.id })
        .brand()
        .name(),
      name: product.name,
      price: product.retailPrice,
    }
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
    const fourReservableStyles = await this.emailUtils.getXReservableProductsForUser(
      4,
      user as User,
      availableStyles
    )
    const payload = await RenderEmail[renderEmailFunc]({
      name: `${user.firstName}`,
      ...this.formatProductGridInput(fourReservableStyles),
      ...renderData,
    })
    await this.sendPreRenderedTransactionalEmail({
      user,
      payload,
      emailId,
    })
    if (fourReservableStyles !== null) {
      await this.addEmailedProductsToCustomer(user, fourReservableStyles)
    }
  }

  private async sendTransactionalEmail({
    to,
    data,
  }: {
    to: string
    data: any
  }) {
    const path = process.cwd()
    const buffer = fs.readFileSync(path + "/" + "master-email.html")
    const emailTemplate = buffer.toString()
    const RenderedEmailTemplate = Handlebars.compile(emailTemplate)

    await this.sendEmail({
      to,
      subject: data.email.subject,
      html: RenderedEmailTemplate(data),
    })
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
    } else {
      await nodemailerTransport.sendMail({
        from: "membership@seasons.nyc",
        ...msg,
      })
    }
  }

  private formatProductGridInput = (
    products: MonsoonProductGridItem[] | null
  ): {
    product1: MonsoonProductGridItem
    product2: MonsoonProductGridItem
    product3: MonsoonProductGridItem
    product4: MonsoonProductGridItem
  } => {
    if (products === null) {
      return {
        product1: null,
        product2: null,
        product3: null,
        product4: null,
      }
    }
    return {
      product1: products?.[0],
      product2: products?.[1],
      product3: products?.[2],
      product4: products?.[3],
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
