import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"

import { ProcessableReservationPhysicalProductArgs } from "./rental.service"

@Injectable()
export class PaymentTestUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  getReservationPhysicalProductWithData = async reservationPhysicalProductId => {
    return await this.prisma.client.reservationPhysicalProduct.findUnique({
      where: { id: reservationPhysicalProductId },
      select: ProcessableReservationPhysicalProductArgs.select,
    })
  }
}
