import { Injectable } from "@nestjs/common"
import { DBService } from "../../../prisma/DB.service"
import { prisma } from "../../../prisma"
import { AuthService } from "../../User/auth.service"
import { ProductUtilsService } from "./product.utils.service"
import { PrismaClientService } from "../../../prisma/client.service"

@Injectable()
export class ProductVariantService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaClientService
  ) {}

  async isSaved(productVariant, ctx) {
    let customer
    try {
      customer = await this.authService.getCustomerFromContext(ctx)
    } catch (error) {
      return false
    }

    const bagItems = await this.prisma.client.bagItems({
      where: {
        productVariant: {
          id: parent.id,
        },
        customer: {
          id: customer.id,
        },
        saved: true,
      },
    })

    return bagItems.length > 0
  }
}
