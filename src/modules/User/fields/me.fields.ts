import { Customer, User } from "@app/decorators"
import { StatementsService } from "@app/modules/Utils/services/statements.service"
import { Info, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
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
    console.log(user)
    return user?.id
  }

  @ResolveField()
  async user(@User() user) {
    return user
  }

  @ResolveField()
  async customer(@Customer() customer, @Info() info) {
    if (!customer) {
      return null
    }
    return this.prisma.binding.query.customer(
      {
        where: { id: customer.id },
      },
      info
    )
  }

  @ResolveField()
  async activeReservation(@Customer() customer, @Info() info) {
    if (!customer) {
      return null
    }
    const reservations = await this.prisma.client
      .customer({ id: customer.id })
      .reservations({ orderBy: "createdAt_DESC" })
    const latestReservation = head(reservations)
    if (
      latestReservation &&
      !["Completed", "Cancelled"].includes(latestReservation.status)
    ) {
      return await this.prisma.binding.query.reservation(
        {
          where: { id: latestReservation.id },
        },
        info
      )
    }

    return null
  }

  @ResolveField()
  async bag(@Info() info, @Customer() customer) {
    if (!customer) {
      return null
    }
    return await this.prisma.binding.query.bagItems(
      {
        where: {
          customer: {
            id: customer.id,
          },
          saved: false,
        },
      },
      info
    )
  }

  @ResolveField()
  async savedItems(@Info() info, @Customer() customer) {
    if (!customer) {
      return null
    }
    return await this.prisma.binding.query.bagItems(
      {
        where: {
          customer: {
            id: customer.id,
          },
          saved: true,
        },
        orderBy: "updatedAt_DESC",
      },
      info
    )
  }

  @ResolveField()
  async notificationBar(@Customer() customer) {
    console.log(customer)
    if (!customer) {
      return null
    }

    let data = null
    if (
      !this.statements.onProductionEnvironment() &&
      process.env.SHOW_TEST_DISMISSABLE_NOTIF === "true"
    ) {
      data = await this.customerService.getNotificationBarData(
        "TestDismissable",
        customer.id
      )
    }
    if (customer?.status === "PaymentFailed") {
      data = await this.customerService.getNotificationBarData(
        "PastDueInvoice",
        customer.id
      )
    }
    return data
  }
}
