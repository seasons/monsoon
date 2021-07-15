import { Customer, User } from "@app/decorators"
import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { PrismaGenerateParams } from "@app/modules/DataLoader/dataloader.types"
import { TransactionsForCustomersLoader } from "@app/modules/Payment/loaders/transactionsForCustomers.loader"
import { ReservationUtilsService } from "@app/modules/Reservation/services/reservation.utils.service"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
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
import { isObject } from "lodash"
import { DateTime } from "luxon"

const getUserIDGenerateParams = {
  model: "Customer",
  select: { id: true, user: { select: { id: true } } },
  formatData: a => a.user.id,
} as PrismaGenerateParams

@Resolver("Customer")
export class CustomerFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly reservationUtils: ReservationUtilsService
  ) {}

  @ResolveField()
  async paymentPlan(
    @Parent() customer,
    @Loader({
      params: {
        model: "PaymentPlan",
        formatWhere: ids =>
          Prisma.validator<Prisma.PaymentPlanWhereInput>()({
            customerMembership: { customer: { id: { in: ids } } },
          }),
      },
      includeInfo: true,
    })
    planLoader
  ) {
    return await planLoader.load(customer.id)
  }

  @ResolveField()
  async coupon(
    @Parent() customer,
    @Loader({
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
  async shouldRequestFeedback(
    @Loader({
      params: {
        model: "ReservationFeedback",
        select: Prisma.validator<Prisma.ReservationFeedbackSelect>()({
          id: true,
          respondedAt: true,
        }),
        orderBy: {
          respondedAt: "desc",
        },
        formatWhere: keys => {
          return Prisma.validator<Prisma.ReservationFeedbackWhereInput>()({
            user: { id: { in: keys } },
          })
        },
      },
    })
    prismaLoader: PrismaDataLoader<{
      id: string
      respondedAt: Date
    }>,
    @User() user
  ) {
    if (!user) {
      return null
    }

    const feedback = await prismaLoader.load(user.id)
    if (!feedback) {
      return null
    }

    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))

    const respondedAtDate =
      feedback?.respondedAt && new Date(feedback.respondedAt)
    if (!respondedAtDate || yesterday > respondedAtDate) {
      return true
    }

    return false
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

    const _custWithData = await this.prisma.client2.customer.findUnique({
      where: { id: customer.id },
      select: {
        user: { select: { verificationStatus: true } },
        detail: {
          select: {
            height: true,
            stylePreferences: true,
            shippingAddress: { select: { address1: true } },
          },
        },
      },
    })
    const custWithData = this.prisma.sanitizePayload(_custWithData, "Customer")

    const values = [
      custWithData?.user?.verificationStatus === "Approved",
      custWithData?.detail?.height !== null,
      custWithData?.detail?.stylePreferences !== null,
      custWithData?.detail?.shippingAddress?.address1 !== null,
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
