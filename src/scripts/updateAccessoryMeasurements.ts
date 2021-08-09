import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const customerID = "ckixg05o306ze0750gl0pi46k"

  const sizes = await ps.client2.accessorySize.findMany()

  for (const size of sizes) {
    const { bridge, length, width, id } = size

    console.log("size", size)

    await ps.client2.accessorySize.update({
      where: { id },
      data: {
        bridge: bridge === null ? null : bridge / 25.4,
        length: length === null ? null : length / 25.4,
        width: width === null ? null : width / 25.4,
      },
    })
  }
}

run()
