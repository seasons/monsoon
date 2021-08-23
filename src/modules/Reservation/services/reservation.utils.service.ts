import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { Package, PrismaPromise, Reservation } from "@prisma/client"
import { head } from "lodash"

import { ReservationWithProductVariantData } from "./reservation.service"

@Injectable()
export class ReservationUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingService: ShippingService
  ) {}

  inventoryStatusOf = (
    res: ReservationWithProductVariantData,
    prodVarId: string
  ) => {
    return res.products.find(prod => prod.productVariant.id === prodVarId)
      .inventoryStatus
  }

  async updateReturnPackageOnCompletedReservation(
    prismaReservation: any,
    returnedPhysicalProducts: any[] // fields specified in getPrismaReservationWithNeededFields
  ): Promise<[PrismaPromise<Package> | PrismaPromise<Reservation>]> {
    const returnedPhysicalProductIDs: {
      id: string
    }[] = returnedPhysicalProducts.map(p => {
      return { id: p.id }
    })
    const returnedProductVariantIDs: string[] = prismaReservation.products
      .filter(p => p.inventoryStatus === "Reservable")
      .map(prod => prod.productVariant.id)
    const weight = await this.shippingService.calcShipmentWeightFromProductVariantIDs(
      returnedProductVariantIDs
    )

    // TODO: Update the logic we use get the package to update. Make use of scanned shipping label.
    const packageToUpdate = head(prismaReservation.returnPackages)
    return [
      this.prisma.client.package.update({
        data: {
          items: { connect: returnedPhysicalProductIDs },
          weight,
        },
        where: { id: packageToUpdate.id },
      }),
    ]
  }
}
