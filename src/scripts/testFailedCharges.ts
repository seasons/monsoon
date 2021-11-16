import "module-alias/register"

import { NestFactory } from "@nestjs/core"

import { AppModule } from "../app.module"
import {
  ProcessableRentalInvoiceSelect,
  RentalService,
} from "../modules/Payment/services/rental.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const app = await NestFactory.createApplicationContext(AppModule)
  const rentalService = app.get(RentalService)

  let invoicesHandled = 0
  const invoicesToHandle = await ps.client.rentalInvoice.findMany({
    where: {
      billingEndAt: {
        lte: new Date(),
      },
      status: { in: ["Draft", "ChargeFailed"] },
    },
    select: ProcessableRentalInvoiceSelect,
  })

  for (const invoice of invoicesToHandle) {
    invoicesHandled++
    await rentalService.processInvoice(invoice, err => {
      console.log("err", err)
    })
    console.log("Count: ", invoicesHandled)
  }
  console.log("finished")
}

run()
