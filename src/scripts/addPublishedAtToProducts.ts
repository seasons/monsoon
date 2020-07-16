import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  for (const product of await ps.client.products()) {
    await ps.client.updateProduct({
      where: { id: product.id },
      data: { publishedAt: product.createdAt },
    })
  }
}

run()
