import {
  Reservation as PrismaReservation,
  Product,
  User,
} from "../../../prisma"

import { EmailDataProvider } from "./email.data.service"
import Handlebars from "handlebars"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"
import { Reservation } from "../../../prisma/prisma.binding"
import { UtilsService } from "../../Utils/services/utils.service"
import fs from "fs"
import nodemailer from "nodemailer"
import sgMail from "@sendgrid/mail"

@Injectable()
export class EmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly data: EmailDataProvider
  ) {}

  sendAdminConfirmationEmail(
    user: User,
    products: any[],
    reservation: Reservation
  ) {
    this.sendTransactionalEmail({
      to: process.env.OPERATIONS_ADMIN_EMAIL,
      data: this.data.reservationReturnConfirmation(
        reservation.reservationNumber,
        products.map(p => p.seasonsUID),
        user.email
      ),
    })
  }

  sendAuthorizedToSubscribeEmail(user: User) {
    const idHash = this.utils.encryptUserIDHash(user.id)
    this.sendTransactionalEmail({
      to: user.email,
      data: this.data.completeAccount(
        user.firstName,
        `${process.env.SEEDLING_URL}/complete?idHash=${idHash}`
      ),
    })
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

    this.sendTransactionalEmail({
      to: user.email,
      data: this.data.reservationConfirmation(
        reservation.reservationNumber,
        reservedItems,
        this.utils.formatReservationReturnDate(new Date(reservation.createdAt)),
        trackingNumber,
        trackingUrl
      ),
    })
  }

  sendReturnReminderEmail(user: User, reservation: PrismaReservation) {
    this.sendTransactionalEmail({
      to: user.email,
      data: this.data.returnReminder({
        name: user.firstName,
        returnDate: this.utils.formatReservationReturnDate(
          new Date(reservation.createdAt)
        ),
      }),
    })
  }

  sendWelcomeToSeasonsEmail(user: User) {
    this.sendTransactionalEmail({
      to: user.email,
      data: this.data.welcomeToSeasons(user.firstName),
    })
  }

  sendYouCanNowReserveAgainEmail(user: User) {
    this.sendTransactionalEmail({
      to: user.email,
      data: this.data.freeToReserve(),
    })
  }

  private getReservationConfirmationDataForProduct = async (product: Product) =>
    this.utils.Identity({
      url: product.images[0].url,
      brand: await this.prisma.client
        .product({ id: product.id })
        .brand()
        .name(),
      name: product.name,
      price: product.retailPrice,
    })

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
