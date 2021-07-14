import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const updatesCoats = async () => {
  const ps = new PrismaService()

  const IDs = [
    "ck2ze97fk0poz0734ss84bypl",
    "ck2ze97b70pos0734s341dmm3",
    "ckpwz376d36jy0798cqezt80y",
  ]

  for (const id of IDs) {
    await ps.client.updateCategory({
      where: { id },
      data: {
        productType: null,
      },
    })
  }
}

updatesCoats()
