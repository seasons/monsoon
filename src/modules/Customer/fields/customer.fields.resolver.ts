import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { Select } from "@app/decorators/select.decorator"
import { PrismaGenerateParams } from "@app/modules/DataLoader/dataloader.types.d"
import { TransactionsForCustomersLoader } from "@app/modules/Payment/loaders/transactionsForCustomers.loader"
import { BagService } from "@app/modules/Product/services/bag.service"
import { CustomerUtilsService } from "@app/modules/User/services/customer.utils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import { Loader } from "@modules/DataLoader/decorators/dataloader.decorator"
import { InvoicesForCustomersLoader } from "@modules/Payment/loaders/invoicesForCustomers.loaders"
import {
  InvoicesDataLoader,
  TransactionsDataLoader,
} from "@modules/Payment/payment.types.d"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { isObject } from "lodash"
import { DateTime } from "luxon"
import semverCompare from "semver-compare"

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
    private readonly utils: UtilsService,
    private readonly customerUtils: CustomerUtilsService,
    private readonly bagService: BagService
  ) {}

  @ResolveField()
  async bagSections(@Parent() customer, @Application() application) {
    if (!customer) {
      return null
    }
    return this.bagService.bagSections({ customer, application })
  }

  @ResolveField()
  async iOSAppStatus(
    @Parent() customer,
    @Loader({
      params: {
        model: "Customer",
        select: Prisma.validator<Prisma.CustomerSelect>()({
          id: true,
          user: {
            select: {
              deviceData: {
                select: {
                  iOSVersion: true,
                },
              },
            },
          },
        }),
      },
    })
    customerLoader: PrismaDataLoader<any>
  ) {
    const custWithData = await customerLoader.load(customer.id)
    if (!custWithData.user.deviceData) {
      return "NoRecord"
    }

    const latestIOSAppVersion = this.customerUtils.getMaxIOSAppVersion()
    if (latestIOSAppVersion == undefined) {
      return "NoRecord"
    }

    const comparison = semverCompare(
      custWithData.user.deviceData.iOSVersion,
      latestIOSAppVersion
    )

    if (comparison === 0) {
      return "UpToDate"
    } else if (comparison === -1) {
      return "Outdated"
    } else {
      // technically an error. Don't blow up the app. Just return NoRecord
      return "NoRecord"
    }
  }

  /*
   * While we transition to new plan types some customers will be
   * grandfathered in with the original plan, i.e. essential and all-access
   */
  @ResolveField()
  async grandfathered(
    @Parent() _customer,
    @Loader({
      params: {
        model: "Customer",
        select: Prisma.validator<Prisma.CustomerSelect>()({
          id: true,
          membership: {
            select: {
              grandfathered: true,
            },
          },
        }),
      },
    })
    prismaLoader: PrismaDataLoader<any>
  ) {
    const customer = await prismaLoader.load(_customer.id)
    return customer.membership?.grandfathered || false
  }

  @ResolveField()
  async paymentPlan(
    @Parent() customer,
    @Loader({
      params: {
        model: "PaymentPlan",
        formatWhere: ids =>
          Prisma.validator<Prisma.PaymentPlanWhereInput>()({
            customerMemberships: { some: { customer: { id: { in: ids } } } },
          }),
        infoFragment: `fragment EnsureCustomerId on PaymentPlan {customerMemberships {customer {id}}}`,
        keyToDataRelationship: "ManyToOne",
        getKeys: a => a.customerMemberships.map(a => a.customer.id),
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
          user: {
            select: {
              id: true,
            },
          },
        }),
        orderBy: {
          respondedAt: "desc",
        },
        getKeys: a => [a.user.id],
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
  async shouldPayForNextReservation(@Parent() customer) {
    // TODO: add loader
    const lastReservation = await this.utils.getLatestReservation(customer.id)

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

    try {
      const userId = await prismaLoader.load(customer.id)
      return await this.paymentService.getCustomerInvoiceHistory(
        userId,
        invoicesLoader,
        transactionsForCustomerLoader
      )
    } catch (e) {
      console.error(e)
      return null
    }
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

    const custWithData = await this.prisma.client.customer.findUnique({
      where: { id: customer.id },
      select: {
        user: { select: { verificationStatus: true } },
        detail: {
          select: {
            topSizes: true,
            stylePreferences: true,
            shippingAddress: { select: { address1: true } },
          },
        },
      },
    })

    const values = [
      custWithData?.user?.verificationStatus === "Approved",
      custWithData?.detail?.topSizes?.length > 0,
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
  async nextFreeSwapDateAt(@Parent() customer) {
    const nextFreeSwapDate = await this.customerUtils.nextFreeSwapDate(
      customer.id
    )
    return nextFreeSwapDate
  }
}
