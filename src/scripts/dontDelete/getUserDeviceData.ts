import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const email = "andre-howell@seasons.nyc"
  const u = await ps.client.user.findFirst({
    where: { email },
    select: { deviceData: { select: { iOSVersion: true } } },
  })
  console.dir(u, { depth: null })
}
run()
