import fs from "fs"

import { Injectable } from "@nestjs/common"
import sgMail from "@sendgrid/mail"
import Handlebars from "handlebars"
import nodemailer from "nodemailer"

import {
  EmailId,
  ID_Input,
  Reservation as PrismaReservation,
  Product,
  User,
} from "../../../prisma"
import { Reservation } from "../../../prisma/prisma.binding"
import { PrismaService } from "../../../prisma/prisma.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { EmailDataProvider } from "./email.data.service"

@Injectable()
export class EmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly data: EmailDataProvider
  ) {}

  async sendAdminConfirmationEmail(
    user: User,
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

  async sendAuthorizedToSubscribeEmail(user: User) {
    await this.sendTransactionalEmail({
      to: user.email,
      data: this.data.completeAccount(user.firstName),
    })
    await this.storeEmailReceipt("CompleteAccount", user.id)
  }

  async sendPriorityAccessEmail(user: User) {
    await this.sendTransactionalEmail({
      to: user.email,
      data: this.data.priorityAccess({ name: user.firstName }),
    })
    await this.storeEmailReceipt("PriorityAccess", user.id)
  }

  async sendReservationConfirmationEmail(
    user: User,
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

  async sendReturnReminderEmail(user: User, reservation: PrismaReservation) {
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

  async sendWelcomeToSeasonsEmail(user: User) {
    await this.sendTransactionalEmail({
      to: user.email,
      data: this.data.welcomeToSeasons(user.firstName),
    })
    await this.storeEmailReceipt("WelcomeToSeasons", user.id)
  }

  async sendYouCanNowReserveAgainEmail(user: User) {
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
    const nodemailerTransport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "7b3330ee47f7b2",
        pass: "e81e7c28792bfa",
      },
    })

    const rendered = RenderedEmailTemplate(data)
    const msg = {
      from: { email: "membership@seasons.nyc", name: "Seasons NYC" },
      to,
      bcc: "emails@seasons.nyc",
      subject: data.email.subject,
      html: rendered,
    }
    if (process.env.NODE_ENV === "production") {
      sgMail.send(msg)
    } else {
      await nodemailerTransport.sendMail({
        from: "membership@seasons.nyc",
        ...msg,
      })
    }
  }
}
