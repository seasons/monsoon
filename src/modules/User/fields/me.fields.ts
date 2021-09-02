import { Customer, User } from "@app/decorators"
import { Select } from "@app/decorators/select.decorator"
import { ReservationService } from "@app/modules/Reservation/services/reservation.service"
import { CustomerService } from "@app/modules/User/services/customer.service"
import { CustomerUtilsService } from "@app/modules/User/services/customer.utils.service"
import { StatementsService } from "@app/modules/Utils/services/statements.service"
import { ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"

// estimate on customer --> membership --> plan requires planID to be on the plan
const EnsureFieldsForDownstreamFieldResolvers = `fragment EnsureFieldsForDownstreamFieldResolvers on Customer {
  id
  membership {
    plan {
      planID
    }
  }
}`
@Resolver("Me")
export class MeFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerService: CustomerService,
    private readonly statements: StatementsService,
    private readonly customerUtils: CustomerUtilsService,
    private readonly reservation: ReservationService
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
  async customer(
    @Customer() customer,
    @Select({
      /*
      Ideally, we should add these fragments for downstream fields conditionally. 
      We want to add fragments upstream rather than add more DB queries downstream so that
      we can minimize the number of DB queries. But we also don't want to add unnecessary data
      to the customer query if the downstream fields for which we query these fields are not on the 
      selection set for a given query. 

      For now we just add the fragment for all queries. Let's optimize it later.
      */
      withFragment: EnsureFieldsForDownstreamFieldResolvers,
    })
    _select
  ) {
    if (!customer) {
      return null
    }
    let select = _select
    if (select?.reservations) {
      select = {
        ...select,
        reservations: {
          ...select.reservations,
          orderBy: { createdAt: "desc" },
        },
      }
    }
    const data = await this.prisma.client.customer.findUnique({
      where: { id: customer.id },
      select,
    })
    return data
  }

  @ResolveField()
  async nextFreeSwapDate(@Customer() customer) {
    if (!customer) {
      return null
    }
    return await this.customerUtils.nextFreeSwapDate(customer.id)
  }

  @ResolveField()
  async activeReservation(
    @Customer() customer,
    @Select({ withFragment: `fragment EnsureStatus on Reservation {status}` })
    select
  ) {
    if (!customer) {
      return null
    }
    const latestReservation = (await this.prisma.client.reservation.findFirst({
      where: {
        customer: {
          id: customer.id,
        },
      },
      orderBy: { createdAt: "desc" },
      select,
    })) as any

    if (this.statements.reservationIsActive(latestReservation)) {
      return latestReservation
    }

    return null
  }

  @ResolveField()
  async bag(@Customer() customer, @Select() select) {
    if (!customer) {
      return null
    }
    const bagItems = await this.prisma.client.bagItem.findMany({
      where: {
        customer: {
          id: customer.id,
        },
        saved: false,
      },
      select,
    })
    return bagItems
  }

  @ResolveField()
  async savedItems(@Customer() customer, @Select() select) {
    if (!customer) {
      return null
    }
    const savedItems = await this.prisma.client.bagItem.findMany({
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
    return savedItems
  }

  @ResolveField()
  async reservationLineItems(@Customer() customer) {
    const result = await this.reservation.draftReservationLineItems(customer)

    return result
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
