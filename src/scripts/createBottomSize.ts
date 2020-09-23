import "module-alias/register"

import chargebee from "chargebee"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY,
  })

  const ps = new PrismaService()
  ps.client.createBottomSize({
    type: "WxL",
    value: "34x34",
    waist: 34,
    inseam: 34,
  })
}

run()
