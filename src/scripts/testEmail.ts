import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import { head } from "lodash"

import { AppModule } from "../app.module"
import { EmailService } from "../modules/Email/services/email.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const app = await NestFactory.createApplicationContext(AppModule)
  const emailService = app.get(EmailService)

  const product = await ps.client.product.findUnique({
    where: {
      id: "ckhdpajqn1aq80733nwy2o0q7",
    },
    select: {
      id: true,
      slug: true,
      name: true,
      images: {
        select: {
          url: true,
          id: true,
        },
      },
      brand: { select: { id: true, name: true } },
      variants: {
        select: {
          id: true,
          displayShort: true,
        },
      },
    },
  })

  await emailService.sendRestockNotificationEmails(
    ["kieran@seasons.nyc"],
    product
  )

  console.log("finished")
}

run()
