import { Injectable } from "@nestjs/common"
import sgMail from "@sendgrid/mail"
import Handlebars from "handlebars"
import nodemailer from "nodemailer"
import fs from "fs"
import { User, Product, Reservation } from "../../../prisma"
import { PrismaClientService } from "../../../prisma/client.service"
import { UtilsService } from "../../Utils/utils.service"
import { EmailDataProvider } from "./email.data.service"
import { AuthService } from "../../User/services/auth.service"

@Injectable()
export class EmailService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaClientService,
    private readonly utils: UtilsService,
    private readonly data: EmailDataProvider
  ) {}

  async sendReservationConfirmationEmail(
    user: User,
    products: Product[],
    reservation: Reservation
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
        this.utils.formatReservationReturnDate(new Date(reservation.createdAt))
      ),
    })
  }

  sendWelcomeToSeasonsEmail(user: User) {
    this.sendTransactionalEmail({
      to: user.email,
      data: this.data.welcomeToSeasons(user.firstName),
    })
  }

  sendAuthorizedToSubscribeEmail(user: User) {
    this.sendTransactionalEmail({
      to: user.email,
      data: this.data.completeAccount(
        user.firstName,
        `${process.env.SEEDLING_URL}/complete?idHash=${this.authService.getUserIDHash(user.id)}`
      ),
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
