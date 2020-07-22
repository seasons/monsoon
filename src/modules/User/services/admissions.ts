import { Customer, User } from "@app/prisma"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"

import { AuthService } from "./auth.service"

@Injectable()
export class AdmissionsService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly shippingService: ShippingService
  ) {}
  // TODO: Write function
  weServiceZipcode(zipcode: string): boolean {
    return false
  }

  // TODO: Write function
  belowWeeklyNewUsersOpsThreshold(): boolean {
    return false
  }

  // TODO: Write function
  haveSufficientInventoryToServiceCustomer(customer: Customer): boolean {
    return false
  }
}
