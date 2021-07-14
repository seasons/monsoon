import { Customer, User } from "@app/decorators"
import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { TransactionsForCustomersLoader } from "@app/modules/Payment/loaders/transactionsForCustomers.loader"
import { ReservationUtilsService } from "@app/modules/Reservation/services/reservation.utils.service"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import { PrismaTwoLoader } from "@app/prisma/prisma2.loader"
import { Loader } from "@modules/DataLoader/decorators/dataloader.decorator"
import { InvoicesForCustomersLoader } from "@modules/Payment/loaders/invoicesForCustomers.loaders"
import {
  InvoicesDataLoader,
  TransactionsDataLoader,
} from "@modules/Payment/payment.types"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { head, isObject } from "lodash"
import { DateTime } from "luxon"

const getUserIDGenerateParams = {
  query: `customers`,
  info: `{
    id
    user {
      id
    }
  }`,
  formatData: a => a.user.id,
}
@Resolver("Customer")
export class CustomerFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly reservationUtils: ReservationUtilsService
  ) {}

  @ResolveField()
  async paymentPlan(@Parent() customer) {
    return await this.prisma.client
      .customer({ id: customer.id })
      .membership()
      .plan()
  }

  @ResolveField()
  async coupon(
    @Parent() customer,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "Customer",
        select: Prisma.validator<Prisma.CustomerSelect>()({
          id: true,
          membership: {
            select: {
              id: true,
            },
          },
          referrer: {
            select: {
              id: true,
            },
          },
          utm: {
            select: {
              source: true,
              medium: true,
              campaign: true,
              term: true,
              content: true,
            },
          },
        }),
      },
    })
    prismaLoader: PrismaDataLoader<string>
  ) {
    let coupon
    const custWithData = (await prismaLoader.load(customer.id)) as any
    const hasSubscribed = !!custWithData?.membership?.id

    if (hasSubscribed) {
      return null
    }

    // Referral coupon
    const wasReferred = !!custWithData?.referrer?.id
    if (wasReferred) {
      // TODO: If we ever need to query this field for N users at a time,
      // cache this result so we don't hit a N+1 issue
      coupon = await this.paymentService.checkCoupon(
        process.env.REFERRAL_COUPON_ID
      )
    }

    // Throwing fits campaign
    const utm = custWithData?.utm
    if (utm?.source?.toLowerCase() === "throwingfits") {
      coupon = await this.paymentService.checkCoupon(
        process.env.THROWING_FITS_COUPON_ID
      )
    }

    // lean luxe campaign
    if (utm?.source?.toLowerCase() === "leanluxe") {
      coupon = await this.paymentService.checkCoupon(
        process.env.LEAN_LUXE_COUPON_ID
      )
    }

    // One Dapper Street campaign
    if (utm?.source?.toLowerCase() === "onedapperstreet") {
      coupon = await this.paymentService.checkCoupon(
        process.env.ONE_DAPPER_STREET_COUPON_ID
      )
    }

    return coupon
  }

  @ResolveField()
  async shouldRequestFeedback(@User() user) {
    if (!user) return null

    const feedbacks = await this.prisma.client2.reservationFeedback.findMany({
      where: {
        user: { id: user.id },
      },
      orderBy: {
        respondedAt: "desc",
      },
      select: {
        id: true,
        respondedAt: true,
      },
    })
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
    if (!feedbacks?.length) {
      return false
    } else {
      const feedback = head(feedbacks)
      const respondedAtDate =
        feedback?.respondedAt && new Date(feedback.respondedAt)
      if (!respondedAtDate || yesterday > respondedAtDate) {
        return true
      } else {
        return false
      }
    }
  }

  @ResolveField()
  async shouldPayForNextReservation(@Customer() customer) {
    // TODO: add loader
    const lastReservation = await this.reservationUtils.getLatestReservation(
      customer
    )

    if (!lastReservation) {
      return false
    }

    const receivedAtPlus30Days = DateTime.fromJSDate(
      lastReservation?.receivedAt
    ).plus({ days: 30 })
    const now = DateTime.local()

    return receivedAtPlus30Days <= now
  }

  @ResolveField()
  async transactions(
    @Parent() customer,
    @Loader({
      type: TransactionsForCustomersLoader.name,
    })
    transactionsForCustomerLoader: TransactionsDataLoader,
    @Loader({
      params: getUserIDGenerateParams,
    })
    prismaLoader: PrismaDataLoader<string>
  ) {
    if (!customer) {
      return null
    }
    const userId = await prismaLoader.load(customer.id)
    return this.paymentService.getCustomerTransactionHistory(
      userId,
      transactionsForCustomerLoader
    )
  }

  @ResolveField()
  async invoices(
    @Parent() customer,
    @Loader({
      type: InvoicesForCustomersLoader.name,
    })
    invoicesLoader: InvoicesDataLoader,
    @Loader({
      type: TransactionsForCustomersLoader.name,
    })
    transactionsForCustomerLoader: TransactionsDataLoader,
    @Loader({
      params: getUserIDGenerateParams,
    })
    prismaLoader: PrismaDataLoader<string>
  ) {
    if (!customer) {
      return null
    }
    const userId = await prismaLoader.load(customer.id)
    return await this.paymentService.getCustomerInvoiceHistory(
      userId,
      invoicesLoader,
      transactionsForCustomerLoader
    )
  }

  @ResolveField()
  async user(
    @Parent() customer,
    @Loader({
      params: getUserIDGenerateParams,
    })
    userIdLoader: PrismaDataLoader<string>,
    @Loader({
      type: PrismaTwoLoader.name,
      params: { model: "User" },
      includeInfo: true,
    })
    userLoader: PrismaDataLoader<any>
  ) {
    if (isObject(customer.user)) {
      return customer.user
    }
    const userId = await userIdLoader.load(customer.id)
    const user = await userLoader.load(userId)
    return user
  }

  @ResolveField()
  async onboardingSteps(@Parent() customer) {
    const steps: string[] = []

    const verificationStatus = await this.prisma.client
      .customer({ id: customer.id })
      .user()
      .verificationStatus()
    const height = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .height()
    const style = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .stylePreferences()
    const shippingAddress = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .shippingAddress()
      .address1()

    const values = [
      verificationStatus === "Approved",
      height !== null,
      style !== null,
      shippingAddress !== null,
    ]
    const keys = [
      "VerifiedPhone",
      "SetMeasurements",
      "SetStylePreferences",
      "SetShippingAddress",
    ]
    for (let i = 0; i < values.length; i++) {
      if (values[i]) {
        steps.push(keys[i])
      }
    }

    return steps
  }

  @ResolveField()
  async reservations(@Parent() customer, @FindManyArgs() { where, ...args }) {
    const _reservations = await this.prisma.client2.reservation.findMany({
      where: { ...where, customer: { id: customer.id } },
      ...args,
    })
    return this.prisma.sanitizePayload(_reservations, "Reservation")
  }
}
