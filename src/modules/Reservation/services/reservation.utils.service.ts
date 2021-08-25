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
    returnedPhysicalProducts: any[], // fields specified in getPrismaReservationWithNeededFields
    trackingNumber: string
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

<<<<<<< HEAD
    // TODO: Update the logic we use get the package to update. Make use of scanned shipping label.
    const packageToUpdate = head(prismaReservation.returnPackages)
=======
    let packageToUpdate = prismaReservation.returnPackages.find(
      a => a.shippingLabel.trackingNumber === trackingNumber
    )
    if (!packageToUpdate) {
      // TODO: Once we get the frontend to send this value, we should no longer default
      // to the first return package. We should instead throw the error outlined below.
      packageToUpdate = head(prismaReservation.returnPackages)
      // throw new Error(
      //   `No return package found with tracking number: ${trackingNumber}`
      // )
    }
>>>>>>> e2f004a4dc024b38cf4d303d4d9d615f91675214
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

  async getUniqueReservationNumber(): Promise<number> {
    let reservationNumber: number
    let foundUnique = false
    while (!foundUnique) {
      reservationNumber = Math.floor(Math.random() * 900000000) + 100000000
      const reservationWithThatNumber = await this.prisma.client.reservation.findUnique(
        {
          where: {
            reservationNumber,
          },
        }
      )
      foundUnique = !reservationWithThatNumber
    }

    return reservationNumber
  }
}
