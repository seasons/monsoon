import fs from "fs"

import { ApplicationType } from "@app/decorators/application.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Inject, Injectable, forwardRef } from "@nestjs/common"
import {
  Customer,
  CustomerAdmissionsData,
  CustomerDetail,
  Location,
  Prisma,
  UTMData,
  User,
} from "@prisma/client"
import {
  BillingInfoUpdateDataInput,
  CustomerAdmissionsDataUpdateInput,
  CustomerStatus,
  CustomerUpdateInput,
  InAdmissableReason,
  NotificationBarID,
} from "@prisma1/index"
import { PrismaService } from "@prisma1/prisma.service"
import * as Sentry from "@sentry/node"
import { ApolloError } from "apollo-server"
import { defaultsDeep, pick } from "lodash"
import { DateTime } from "luxon"

import { AdmissionsService, TriageFuncResult } from "./admissions.service"
import { AuthService } from "./auth.service"

type TriageCustomerStatusResult = "Waitlisted" | "Authorized"

type TriageCustomerResult = {
  status: TriageCustomerStatusResult
  waitlistReason?: InAdmissableReason
}

type CustomerWithUser = Customer & {
  detail: CustomerDetail & {
    shippingAddress: Location
  }
  user: User
  admissions: CustomerAdmissionsData
}

type UpdateCustomerAdmissionsDataInput = TriageCustomerResult & {
  customer: any
  dryRun: boolean
  inServiceableZipcode?: boolean
  allAccessEnabled?: boolean
}

@Injectable()
export class CustomerService {
  triageCustomerInfo = {
    id: true,
    status: true,
    detail: {
      select: {
        shippingAddress: { select: { zipCode: true } },
        topSizes: true,
        waistSizes: true,
        impactId: true,
        discoveryReference: true,
      },
    },
    utm: true,
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        emails: { select: { emailId: true } },
      },
    },
    admissions: { select: { authorizationsCount: true } },
  }

  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
    private readonly shipping: ShippingService,
    private readonly admissions: AdmissionsService,
    private readonly segment: SegmentService,
    private readonly email: EmailService,
    private readonly pushNotification: PushNotificationService,
    private readonly sms: SMSService,
    private readonly utils: UtilsService
  ) {}

  async setCustomerPrismaStatus(user: User, status: CustomerStatus) {
    const customer = await this.auth.getCustomerFromUserID(user.id)

    return await this.prisma.client2.customer.update({
      data: { status },
      where: { id: customer.id },
    })
  }

  async addCustomerLocationShippingOptions(
    destinationState,
    shippingAddressID
  ) {
    const shippingMethods = await this.prisma.client2.shippingMethod.findMany()
    const warehouseLocation = await this.prisma.client2.location.findUnique({
      where: {
        slug:
          process.env.SEASONS_CLEANER_LOCATION_SLUG ||
          "seasons-cleaners-official",
      },
    })

    const shippingOptionsData = JSON.parse(
      fs.readFileSync(
        process.cwd() + "/src/modules/Shipping/shippingOptionsData.json",
        "utf-8"
      )
    )
    const originState = warehouseLocation.state
    const shippingOptions = []

    for (const method of shippingMethods) {
      const stateData =
        shippingOptionsData[method.code].from[originState].to[destinationState]

      const shippingOption = await this.prisma.client2.shippingOption.create({
        data: {
          origin: { connect: { id: warehouseLocation.id } },
          destination: { connect: { id: shippingAddressID } },
          shippingMethod: { connect: { id: method.id } },
          externalCost: stateData.price,
          averageDuration: stateData.averageDuration,
        },
      })

      shippingOptions.push(shippingOption)
    }

    return await this.prisma.client2.location.update({
      where: { id: shippingAddressID },
      data: {
        shippingOptions: {
          set: shippingOptions.map(s => ({ id: s.id })),
        },
      },
    })
  }

  async addCustomerDetails({ details, status }, customer, user, select) {
    const groupedKeys = ["name", "address1", "address2", "city", "state"]
    const isUpdatingShippingAddress =
      details.shippingAddress?.create &&
      Object.keys(details.shippingAddress?.create)?.some(key =>
        groupedKeys.includes(key)
      )
    if (isUpdatingShippingAddress) {
      const {
        name,
        address1: street1,
        city,
        state,
        zipCode: zip,
      } = details.shippingAddress.create
      if (!(street1 && city && state && zip)) {
        throw new Error(
          "Missing a required field. Expected address1, city, state, and zipCode."
        )
      }
      const {
        isValid: shippingAddressIsValid,
      } = await this.shipping.shippoValidateAddress({
        name,
        street1,
        city,
        state,
        zip,
      })
      if (!shippingAddressIsValid) {
        throw new Error("Shipping address is invalid")
      }

      if (!!state && state.length > 2) {
        const abbreviatedState = this.utils.abbreviateState(state)
        if (abbreviatedState) {
          details.shippingAddress.create.state = abbreviatedState
        } else {
          throw new Error("Shipping address state is invalid")
        }
      }
    }

    const updatedCustomer = await this.prisma.client2.customer.update({
      data: {
        detail: {
          upsert: {
            update: details,
            create: details,
          },
        },
      },
      where: { id: customer.id },
      select,
    })

    if (isUpdatingShippingAddress) {
      const state = details.shippingAddress?.create?.state?.toUpperCase()
      if (!state) {
        throw new Error("State missing in shipping address update")
      }
      const detail = await this.prisma.client2.customerDetail.findFirst({
        where: {
          customer: {
            id: customer.id,
          },
        },
        select: {
          id: true,
          shippingAddress: true,
        },
      })
      this.addCustomerLocationShippingOptions(state, detail.shippingAddress.id)
    }

    // If a status was passed, update the customer status in prisma
    if (!!status) {
      await this.setCustomerPrismaStatus(user, status)
    }

    // Return the updated customer object
    return updatedCustomer
  }

  async updateCustomerDetail(user, customer, shippingAddress, phoneNumber) {
    const {
      city: shippingCity,
      postalCode: shippingPostalCode,
      street1: shippingStreet1,
      street2: shippingStreet2,
    } = shippingAddress

    let shippingState
    const shippingAddressState = shippingAddress?.state
    if (!!shippingAddressState && shippingAddressState.length > 2) {
      shippingState = this.utils.abbreviateState(shippingAddressState)
    } else {
      shippingState = shippingAddressState.toUpperCase()
    }

    const {
      isValid: shippingAddressIsValid,
    } = await this.shipping.shippoValidateAddress({
      name: user.firstName,
      street1: shippingStreet1,
      city: shippingCity,
      state: shippingState,
      zip: shippingPostalCode,
    })
    if (!shippingAddressIsValid) {
      throw new Error("Shipping address is invalid")
    }

    // Update the user's shipping address
    const shippingAddressData = {
      slug: `${user.firstName}-${user.lastName}-shipping-address-${Date.now()}`,
      name: `${user.firstName} ${user.lastName}`,
      city: shippingCity,
      zipCode: shippingPostalCode,
      state: shippingState?.toUpperCase(),
      address1: shippingStreet1,
      address2: shippingStreet2,
    }
    const custWithData = await this.prisma.client2.customer.findFirst({
      where: { id: customer.id },
      select: {
        id: true,
        admissions: {
          select: {
            id: true,
          },
        },
      },
    })

    const sanitizedPhoneNumber = phoneNumber.replace(/-/g, "")
    const data = {
      detail: {
        upsert: {
          create: {
            phoneNumber: sanitizedPhoneNumber,
            shippingAddress: { create: shippingAddressData },
          },
          update: {
            phoneNumber: sanitizedPhoneNumber,
            shippingAddress: {
              upsert: {
                create: shippingAddressData,
                update: shippingAddressData,
              },
            },
          },
        },
      },
    } as Prisma.CustomerUpdateInput

    // If they already have an admissions record, update allAccessEnabled
    if (!!custWithData?.admissions?.id) {
      const {
        detail: { allAccessEnabled },
      } = this.admissions.zipcodeAllowed(shippingPostalCode)
      data.admissions = {
        update: { allAccessEnabled },
      }
    }
    return await this.prisma.client2.customer.update({
      where: { id: customer.id },
      data,
    })
  }

  async updateCustomerBillingInfo({
    billingInfo,
    customerId,
  }: {
    billingInfo: BillingInfoUpdateDataInput
    customerId: string
  }) {
    const customer = await this.prisma.client2.customer.findFirst({
      where: { id: customerId },
      select: {
        id: true,
        billingInfoId: true,
      },
    })

    if (customer.billingInfoId) {
      return await this.prisma.client2.billingInfo.update({
        data: billingInfo,
        where: { id: customer.billingInfoId },
      })
    }
  }

  async updateCustomer(args, select, application: ApplicationType) {
    let { where, data, withContact = true } = args

    const defaultSelect = Prisma.validator<Prisma.CustomerSelect>()({
      id: true,
      user: {
        select: {
          id: true,
          email: true,
          emails: { select: { emailId: true } },
          firstName: true,
          lastName: true,
        },
      },
      utm: true,
      detail: {
        select: {
          shippingAddress: { select: { zipCode: true } },
          impactId: true,
          discoveryReference: true,
        },
      },
      plan: true,
      status: true,
      admissions: { select: { authorizationsCount: true } },
    })

    const mergedSelect: typeof defaultSelect = defaultsDeep(
      defaultSelect,
      select
    )

    const customer = await this.prisma.client2.customer.findFirst({
      where,
      select: mergedSelect,
    })

    if (
      ["Waitlisted", "Invited"].includes(customer.status) &&
      data.status &&
      data.status === "Authorized"
    ) {
      const {
        pass: haveSufficientInventory,
        detail: { availableBottomStyles, availableTopStyles },
      } = await this.admissions.haveSufficientInventoryToServiceCustomer(where)

      if (!haveSufficientInventory) {
        throw new Error("Can not authorize user. Insufficient inventory")
      }

      const {
        pass: inServiceableZipcode,
        detail: { allAccessEnabled },
      } = this.admissions.zipcodeAllowed(
        customer.detail.shippingAddress.zipCode
      )

      if (!inServiceableZipcode) {
        throw new Error(`Can not authorize user. In nonserviceable zipcode`)
      }

      const now = DateTime.local()
      const nowDate = now.toISO()
      const sevenDaysFromNow = now.plus({ days: 7 }).toISO()
      data = {
        ...data,
        authorizedAt: nowDate,
        admissions: {
          upsert: {
            create: {
              authorizationWindowClosesAt: sevenDaysFromNow,
              admissable: true,
              inServiceableZipcode: true,
              allAccessEnabled,
              authorizationsCount: this.calculateNumAuthorizations(
                customer,
                data.status,
                false
              ),
            },
            update: {
              authorizationWindowClosesAt: sevenDaysFromNow,
              allAccessEnabled,
              authorizationsCount: this.calculateNumAuthorizations(
                customer,
                data.status,
                false
              ),
            },
          },
        },
      } as CustomerUpdateInput

      if (withContact) {
        // Normal users
        if (customer.status === "Waitlisted") {
          await this.email.sendAuthorizedEmail(customer.user, "manual", [
            ...availableBottomStyles,
            ...availableTopStyles,
          ])
        }
        // Users we invited off the admin
        if (customer.status === "Invited") {
          await this.email.sendPriorityAccessEmail(customer.user)
        }

        // either kind of user
        await this.pushNotification.pushNotifyUsers({
          emails: [customer.user.email],
          pushNotifID: "CompleteAccount",
        })
        await this.sms.sendSMSById({
          to: { id: customer.user.id },
          renderData: { name: customer.user.firstName },
          smsId: "CompleteAccount",
        })
      }

      this.segment.trackBecameAuthorized(customer.user.id, {
        previousStatus: customer.status as CustomerStatus,
        firstName: customer.user.firstName,
        lastName: customer.user.lastName,
        email: customer.user.email,
        method: "Manual",
        application,
        impactId: customer.detail?.impactId,
        discoveryReference: customer.detail?.discoveryReference,
        ...this.utils.formatUTMForSegment(customer.utm),
      })
    }

    return this.prisma.client2.customer.update({
      where,
      data,
      select: mergedSelect,
    })
  }

  async triageCustomer(
    where: Prisma.CustomerWhereUniqueInput,
    application: ApplicationType,
    dryRun: boolean
  ): Promise<TriageCustomerResult> {
    const customer = await this.prisma.client2.customer.findUnique({
      where,
      select: this.triageCustomerInfo,
    })

    if (
      !this.admissions.isTriageable(customer.status as CustomerStatus) &&
      !dryRun
    ) {
      throw new ApolloError(
        `Invalid customer status: ${customer.status}. Can not triage a ${customer.status} customer`
      )
    }
    let status = "Waitlisted" as TriageCustomerStatusResult

    const triageFuncs = [
      {
        func: async () =>
          Promise.resolve({
            pass: process.env.AUTOMATIC_ADMISSIONS === "true",
            detail: {
              automaticAdmissionsFlag: process.env.AUTOMATIC_ADMISSIONS,
            },
          }),
        waitlistReason: "AutomaticAdmissionsFlagOff",
      },
      {
        func: async () =>
          Promise.resolve(
            this.admissions.zipcodeAllowed(
              customer.detail.shippingAddress.zipCode
            )
          ),
        waitlistReason: "UnserviceableZipcode",
      },
      {
        func: async () =>
          this.admissions.belowWeeklyNewActiveUsersOpsThreshold(),
        waitlistReason: "OpsThresholdExceeded",
      },
      {
        func: async () =>
          this.admissions.haveSufficientInventoryToServiceCustomer(where),
        waitlistReason: "InsufficientInventory",
      },
    ] as {
      func: () => Promise<TriageFuncResult>
      waitlistReason: InAdmissableReason
    }[]
    let triageDetail = {} as any
    let reason: InAdmissableReason
    let admit = true
    let availableStyles = []
    let inServiceableZipcode: boolean
    let allAccessEnabled: boolean
    try {
      for (const { func, waitlistReason } of triageFuncs) {
        const { pass, detail } = await func()

        // Store key results of the serviceable zipcode lookup to store it
        // on the customer later
        if (waitlistReason === "UnserviceableZipcode") {
          inServiceableZipcode = pass
          ;({ allAccessEnabled } = detail)
        }

        // Format the available styles for the subscribed email
        if (
          Object.keys(detail).includes("availableBottomStyles") &&
          Object.keys(detail).includes("availableTopStyles")
        ) {
          availableStyles = [
            ...detail.availableBottomStyles,
            ...detail.availableTopStyles,
          ]
        }

        // Keep accumulating triage details
        triageDetail = { ...triageDetail, ...detail }

        // Should we continue or not?
        admit = admit && pass
        if (!admit) {
          reason = waitlistReason
          break
        }
      }
    } catch (err) {
      admit = false
      Sentry.captureException(err)
    }

    if (admit) {
      status = "Authorized"
    }

    // If it's not a dry run, log events and send comms
    if (!dryRun) {
      if (admit) {
        this.segment.trackBecameAuthorized(customer.user.id, {
          previousStatus: customer.status as CustomerStatus,
          firstName: customer.user.firstName,
          lastName: customer.user.lastName,
          email: customer.user.email,
          method: "Automatic",
          application,
          impactId: customer.detail?.impactId,
          discoveryReference: customer.detail?.discoveryReference,
          ...this.utils.formatUTMForSegment(customer.utm as UTMData),
        })

        await this.email.sendAuthorizedEmail(
          customer.user,
          "automatic",
          availableStyles
        )
      } else {
        await this.email.sendWaitlistedEmail(customer.user)
      }

      if (Object.keys(triageDetail).includes("availableBottomStyles")) {
        triageDetail.availableBottomStyles =
          triageDetail.availableBottomStyles.length
      }
      if (Object.keys(triageDetail).includes("availableTopStyles")) {
        triageDetail.availableTopStyles = triageDetail.availableTopStyles.length
      }
      this.segment.track(customer.user.id, "Triaged", {
        ...pick(customer.user, ["firstName", "lastName", "email"]),
        decision: status,
        waitlistReason: !!reason ? reason : null,
        ...triageDetail,
      })
    }

    await this.updateCustomerAfterTriage({
      customer,
      status,
      waitlistReason: reason,
      inServiceableZipcode,
      allAccessEnabled,
      dryRun,
    })

    return { status, waitlistReason: reason }
  }

  async getNotificationBarData(
    notificationBarId: NotificationBarID,
    customerId
  ) {
    const data = this.utils.parseJSONFile("src/modules/User/notificationBar")[
      notificationBarId
    ]
    const palette = this.utils.parseJSONFile(
      "src/modules/User/notificationBarColorSchemas"
    )[data.paletteID]

    const receiptData = await this.prisma.client2.customerNotificationBarReceipt.findFirst(
      {
        where: {
          AND: [
            { notificationBarId },
            { customer: { every: { id: customerId } } },
          ],
        },
      }
    )

    return {
      ...data,
      palette,
      ...pick(receiptData, ["viewCount", "clickCount"]),
      id: notificationBarId,
    }
  }

  private async updateCustomerAfterTriage({
    customer,
    status,
    waitlistReason,
    inServiceableZipcode,
    allAccessEnabled,
    dryRun,
  }: UpdateCustomerAdmissionsDataInput) {
    let data = {} as any
    let admissionsUpsertData = {} as any

    if (!dryRun) {
      data = { status }
    }
    switch (status) {
      case "Authorized":
        admissionsUpsertData = {
          admissable: true,
          inServiceableZipcode: true,
          inAdmissableReason: null,
          allAccessEnabled,
          authorizationsCount: this.calculateNumAuthorizations(
            customer,
            status,
            dryRun
          ),
        }
        if (!dryRun) {
          const now = DateTime.local()
          const nowDate = now.toISO()
          const sevenDaysFromNow = now.plus({ days: 7 }).toISO()
          data.authorizedAt = nowDate
          admissionsUpsertData.authorizationWindowClosesAt = sevenDaysFromNow
        }

        break
      case "Waitlisted":
        if (inServiceableZipcode === undefined) {
          ;({
            pass: inServiceableZipcode,
            detail: { allAccessEnabled },
          } = this.admissions.zipcodeAllowed(
            customer.detail?.shippingAddress?.zipCode
          ))
        }
        // Handle the inserviceableZipcode
        admissionsUpsertData = {
          admissable: false,
          inServiceableZipcode,
          allAccessEnabled,
          inAdmissableReason: waitlistReason,
          authorizationsCount: this.calculateNumAuthorizations(
            customer,
            status,
            dryRun
          ),
        }
        break
      default:
        throw new Error(`Invalid status: ${status}`)
    }
    if (
      !dryRun ||
      (dryRun &&
        this.shouldUpdateCustomerAdmissionsData(customer, admissionsUpsertData))
    ) {
      await this.prisma.client2.customer.update({
        where: { id: customer.id },
        data: {
          ...data,
          admissions: {
            upsert: {
              update: admissionsUpsertData as CustomerAdmissionsDataUpdateInput,
              create: admissionsUpsertData,
            },
          },
        },
      })
      this.segment.identify(customer.user.id, admissionsUpsertData)
    }
  }

  private shouldUpdateCustomerAdmissionsData(
    customer: Customer & { admissions: CustomerAdmissionsData },
    upsertData: CustomerAdmissionsDataUpdateInput
  ) {
    return (
      customer?.admissions?.admissable !== upsertData.admissable ||
      customer?.admissions?.authorizationsCount !==
        upsertData.authorizationsCount ||
      customer?.admissions?.inAdmissableReason !==
        upsertData.inAdmissableReason ||
      customer?.admissions?.inServiceableZipcode !==
        upsertData.inServiceableZipcode ||
      customer?.admissions?.allAccessEnabled !== upsertData.allAccessEnabled
    )
  }

  private calculateNumAuthorizations(
    customer,
    status: CustomerStatus,
    dryRun: boolean
  ) {
    const hasExistingAuthorizationsCount =
      typeof customer?.admissions?.authorizationsCount === "number"

    const numCompleteAccountEmails =
      customer.user?.emails?.filter(a => a.emailId === "CompleteAccount")
        ?.length || 0

    const baseline = hasExistingAuthorizationsCount
      ? customer.admissions.authorizationsCount
      : numCompleteAccountEmails

    if (!dryRun && status === "Authorized") {
      return baseline + 1
    }
    return baseline
  }
}
