import "module-alias/register"

import { UPSService } from "../modules/Shipping/services/ups.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ups = new UPSService()

  const a = await ups.validateAddress({
    street1: "55 Washington St",
    state: "NY",
    city: "Brooklyn",
    zip: "11201",
  })
  console.dir(a, { depth: null })
}
run()
