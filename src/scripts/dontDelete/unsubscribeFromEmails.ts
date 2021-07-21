import "module-alias/register"

import { NestFactory } from "@nestjs/core"

import { AppModule } from "../../app.module"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const app = await NestFactory.createApplicationContext(AppModule)
  const ps = app.get(PrismaService)
  await ps.client2.user.updateMany({
    where: { email: { contains: "faiyam" } },
    data: { sendSystemEmails: false },
  })
  console.log("done")
}
run()
