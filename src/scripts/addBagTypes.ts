import "module-alias/register"

import { NestFactory } from "@nestjs/core"

import { AppModule } from "../app.module"
import { EmailService } from "../modules/Email/services/email.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const app = await NestFactory.createApplicationContext(AppModule)

  const bagParentCategory = await ps.client.category.findUnique({
    where: {
      slug: "bags",
    },
    select: {
      id: true,
      children: {
        select: {
          id: true,
        },
      },
    },
  })

  const newBagTypes = [
    {
      slug: "messenger-bags",
      name: "Messenger bags",
      singularName: "Messenger bag",
    },
    {
      slug: "belt-bag",
      name: "Belt bags",
      singularName: "Belt bag",
    },
    {
      slug: "shoulder-bags",
      name: "Shoulder Bags",
      singularName: "Shoulder Bag",
    },
  ]

  for (const type of newBagTypes) {
    await ps.client.category.create({
      data: {
        slug: type.slug,
        name: type.name,
        singularName: type.singularName,
        recoupment: 5,
        visible: false,
        dryCleaningFee: 75,
        productType: "Accessory",
        measurementType: "Inches",
        parents: {
          connect: {
            id: bagParentCategory.id,
          },
        },
      },
    })
  }

  console.log("finished")
}

run()
