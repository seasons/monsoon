import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const sizes = [
    { value: "34x13", waist: 34 },
    { value: "36x13", waist: 36 },
    { value: "34x11", waist: 34 },
    { value: "36x11", waist: 36 },
    { value: "32x34", waist: 32 },
    { value: "36x34", waist: 36 },
    { value: "36x32", waist: 36 },
  ]

  for (const size of sizes) {
    await ps.client.createBottomSize({
      type: "WxL",
      value: size.value,
      waist: size.waist,
    })
  }
}

run()
