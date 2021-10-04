import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { Select } from "@app/decorators/select.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { InventoryStatus, PhysicalProductStatus } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { pick } from "lodash"

import { ReservationService } from ".."

interface ProductStates {
  productUID: string
  returned: boolean
  productStatus: PhysicalProductStatus
  notes: string
}

@Resolver()
export class ReservationPhysicalProductResolver {
  constructor(
    private readonly reservation: ReservationService,
    private readonly segment: SegmentService,
    private readonly prisma: PrismaService
  ) {}
  @Mutation()
  async returnMultiItem(
    trackingNumber: string,
    productStates: ProductStates[]
  ) {}
}
