import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const allEvents = await ps.client.packageTransitEvent.findMany({
    select: { id: true, data: true },
  })
  for (const event of allEvents) {
    try {
      const jsonData = JSON.parse(event.data as string)
      await ps.client.packageTransitEvent.update({
        where: { id: event.id },
        data: { data: jsonData },
      })
    } catch (err) {
      console.log(event.id, err)
    }
  }
}
run()
