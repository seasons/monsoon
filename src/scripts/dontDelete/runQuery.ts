import "module-alias/register"

import { UniqueArgumentNames } from "graphql/validation/rules/UniqueArgumentNames"
import { uniq } from "lodash"

import { ErrorService } from "../../modules//Error/services/error.service"
import { RentalService } from "../../modules/Payment/services/rental.service"
import { ShippingService } from "../../modules/Shipping/services/shipping.service"
import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const timeService = new TimeUtilsService()
  const error = new ErrorService()
  const utils = new UtilsService(ps)
  const shipping = new ShippingService(ps, utils)
  const rs = new RentalService(ps, timeService, error, shipping)

  const billedRentalInvoices = await ps.client.rentalInvoice.findMany({
    where: {
      status: "Billed",
    },
    select: {
      id: true,
    },
  })

  const promises = []

  for (const rentalInvoice of billedRentalInvoices) {
  }
}

run()
