import { Customer, User } from "@app/decorators"
import { Select } from "@app/decorators/select.decorator"
import { StatementsService } from "@app/modules/Utils/services/statements.service"
import { Info, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"
import { head } from "lodash"

import { CustomerService } from "../services/customer.service"

@Resolver("Me")
export class MeFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerService: CustomerService,
    private readonly statements: StatementsService
  ) {}

  @ResolveField()
  async id(@User() user) {
    return user?.id
  }

  @ResolveField()
  async user(@User() user) {
    return user
  }

  @ResolveField()
  async customer(@Customer() customer, @Select() select) {
    if (!customer) {
      return null
    }
    const _data = await this.prisma.client2.customer.findUnique({
      where: { id: customer.id },
      select,
    })
    return this.prisma.sanitizePayload(_data, "Customer")
  }

  @ResolveField()
  async activeReservation(@Customer() customer, @Select() select) {
    if (!customer) {
      return null
    }
    const _latestReservation = await this.prisma.client2.reservation.findFirst({
      where: {
        customer: {
          id: customer.id,
        },
      },
      orderBy: { createdAt: "desc" },
      select,
    })
    const latestReservation: any = this.prisma.sanitizePayload(
      _latestReservation,
      "Reservation"
    )

    if (
      latestReservation &&
      !["Completed", "Cancelled"].includes(latestReservation.status)
    ) {
      return latestReservation
    }

    return null
  }

  @ResolveField()
  async bag(@Customer() customer, @Select() select) {
    if (!customer) {
      return null
    }
    const _bagItems = await this.prisma.client2.bagItem.findMany({
      where: {
        customer: {
          id: customer.id,
        },
        saved: false,
      },
      select,
    })
    const bagItems = this.prisma.sanitizePayload(_bagItems, "BagItem")
    return bagItems
  }

  @ResolveField()
  async savedItems(@Customer() customer, @Select() select) {
    if (!customer) {
      return null
    }
    const _savedItems = await this.prisma.client2.bagItem.findMany({
      where: {
        customer: {
          id: customer.id,
        },
        saved: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select,
    })
    const savedItems = await this.prisma.sanitizePayload(_savedItems, "BagItem")
    return savedItems
  }

  @ResolveField()
  async notificationBar(@Customer() customer) {
    if (!customer) {
      return null
    }

    let data = null
    if (customer?.status === "PaymentFailed") {
      data = await this.customerService.getNotificationBarData(
        "PastDueInvoice",
        customer.id
      )
    } else if (customer?.status === "Authorized") {
      data = await this.customerService.getNotificationBarData(
        "AuthorizedReminder",
        customer.id
      )
    } else if (
      !this.statements.onProductionEnvironment() &&
      process.env.SHOW_TEST_DISMISSABLE_NOTIF === "true"
    ) {
      data = await this.customerService.getNotificationBarData(
        "TestDismissable",
        customer.id
      )
    }
    return data
  }
}
