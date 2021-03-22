import "module-alias/register"

import zipcodes from "zipcodes"

import { DripService } from "../../modules/Drip/services/drip.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const locationsToUpdate = await ps.client.locations({
    // where: { OR: [{ lat: null }, { lng: null }] },
  })
  for (const l of locationsToUpdate) {
    const { latitude, longitude } = zipcodes.lookup(l.zipCode) || {}
    if (!!latitude && !!longitude) {
      await ps.client.updateLocation({
        where: { id: l.id },
        data: { lat: latitude, lng: longitude },
      })
    }
  }
}

run()
