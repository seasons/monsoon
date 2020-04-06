import { Injectable } from "@nestjs/common"
import { ReservationWithProductVariantData } from "./reservation.service"
import { ID_Input, InventoryStatus } from "@prisma/index"

@Injectable()
export class ReservationUtilsService {
  inventoryStatusOf = (
    res: ReservationWithProductVariantData,
    prodVarId: ID_Input
  ): InventoryStatus => {
    return res.products.find(prod => prod.productVariant.id === prodVarId)
      .inventoryStatus
  }
}
