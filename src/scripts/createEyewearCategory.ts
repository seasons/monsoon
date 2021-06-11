import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const eyewear = await ps.client.createCategory({
    slug: "eyewear",
    name: "Eyewear",
    visible: false,
  })

  await ps.client.createCategory({
    slug: "accessories",
    name: "Accessories",
    visible: false,
    children: {
      connect: [{ id: eyewear.id }],
    },
  })
}
run()
