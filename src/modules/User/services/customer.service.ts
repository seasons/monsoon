import fs from "fs"

import { ApplicationType } from "@app/decorators/application.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Inject, Injectable, forwardRef } from "@nestjs/common"
import {
  Customer,
  CustomerAdmissionsData,
  CustomerDetail,
  CustomerStatus,
  InAdmissableReason,
  Location,
  NotificationBarID,
  Prisma,
  UTMData,
  User,
} from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import * as Sentry from "@sentry/node"
import { ApolloError } from "apollo-server"
import { defaultsDeep, head, pick } from "lodash"
import { DateTime } from "luxon"

import { AdmissionsService, TriageFuncResult } from "./admissions.service"
import { AuthService } from "./auth.service"

type TriageCustomerStatusResult = "Waitlisted" | "Authorized"

type TriageCustomerResult = {
  status: TriageCustomerStatusResult
  waitlistReason?: InAdmissableReason
}

type UpdateCustomerAdmissionsDataInput = TriageCustomerResult & {
  customer: any
  dryRun: boolean
  inServiceableZipcode?: boolean
  allAccessEnabled?: boolean
}

@Injectable()
export class CustomerService {
  triageCustomerSelect = Prisma.validator<Prisma.CustomerSelect>()({
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
  })

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

    return await this.prisma.client.customer.update({
      data: { status },
      where: { id: customer.id },
    })
  }

  async addCustomerDetails({ details, status }, customer, user, select) {
    let data = { ...details }

    // Handle shipping address payload
    const groupedKeys = ["name", "address1", "address2", "city", "state"]
    const isUpdatingShippingAddress =
      details.shippingAddress?.create &&
      Object.keys(details.shippingAddress?.create)?.some(key =>
        groupedKeys.includes(key)
      )
    if (isUpdatingShippingAddress) {
      const addressCreateData = details.shippingAddress.create
      const name = addressCreateData.name?.trim()
      const address1 = addressCreateData.address1?.trim()
      const address2 = addressCreateData.address2?.trim()
      const city = addressCreateData.city?.trim()
      const state = addressCreateData.state?.trim()
      const zip = addressCreateData.zipCode?.trim()
      if (!(address1 && city && state && zip)) {
        throw new Error(
          "Missing a required field. Expected address1, city, state, and zipCode."
        )
      }
      const {
        isValid: shippingAddressIsValid,
      } = await this.shipping.shippoValidateAddress({
        name,
        street1: address1,
        street2: address2,
        city,
        state,
        zip,
      })
      if (!shippingAddressIsValid) {
        throw new Error("Shipping address is invalid")
      }

      data.shippingAddress.create = {
        name,
        address1,
        address2,
        city,
        state,
        zipCode: zip,
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

    if (details?.signupLikedProducts?.connect?.length > 0) {
      const productIDs = details?.signupLikedProducts?.connect.map(p => p.id)
      await this.addLikedSignUpProductsToBagItems(productIDs, customer)
    }

    const detail = await this.prisma.client.customerDetail.findFirst({
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
    Object.keys(details).map(detailKey => {
      if (["topSizes", "waistSizes", "weight", "styles"].includes(detailKey)) {
        const values = details[detailKey].set
        details[detailKey] = values
      }
    })

    await this.prisma.client.customerDetail.update({
      data: data,
      where: {
        id: detail.id,
      },
    })

    if (isUpdatingShippingAddress) {
      const state = details.shippingAddress?.create?.state?.toUpperCase()
      if (!state) {
        throw new Error("State missing in shipping address update")
      }
    }

    // If a status was passed, update the customer status in prisma
    if (!!status) {
      await this.setCustomerPrismaStatus(user, status)
    }

    const updatedCustomer = await this.prisma.client.customer.findUnique({
      where: { id: customer.id },
      select,
    })

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
    const custWithData = await this.prisma.client.customer.findFirst({
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
    return await this.prisma.client.customer.update({
      where: { id: customer.id },
      data,
    })
  }

  async updateCustomerBillingInfo({
    billingInfo,
    customerId,
  }: {
    billingInfo: Prisma.BillingInfoUpdateInput
    customerId: string
  }) {
    const customer = await this.prisma.client.customer.findFirst({
      where: { id: customerId },
      select: {
        id: true,
        billingInfoId: true,
      },
    })

    if (customer.billingInfoId) {
      return await this.prisma.client.billingInfo.update({
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

    const customer = await this.prisma.client.customer.findFirst({
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
      } as Prisma.CustomerUpdateInput

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

    return this.prisma.client.customer.update({
      where,
      data,
      select: mergedSelect,
    })
  }

  async updateCreditBalance(
    membershipId: string,
    amount: number,
    reason: string
  ) {
    const promises = []

    promises.push(
      this.prisma.client.customerMembership.update({
        where: {
          id: membershipId,
        },
        data: {
          creditUpdateHistory: {
            create: {
              amount: amount,
              reason: reason,
            },
          },
          creditBalance: { increment: amount },
        },
      })
    )

    const results = await this.prisma.client.$transaction(promises)
    const updatedCustomerMembership = results.pop()
    return !!updatedCustomerMembership
  }

  async triageCustomer(
    where: Prisma.CustomerWhereUniqueInput,
    application: ApplicationType,
    dryRun: boolean
  ): Promise<TriageCustomerResult> {
    const customer = await this.prisma.client.customer.findUnique({
      where,
      select: this.triageCustomerSelect,
    })

    if (!this.admissions.isTriageable(customer.status) && !dryRun) {
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

    const receiptData = await this.prisma.client.customerNotificationBarReceipt.findFirst(
      {
        where: {
          AND: [{ notificationBarId }, { customer: { id: customerId } }],
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
      await this.prisma.client.customer.update({
        where: { id: customer.id },
        data: {
          ...data,
          admissions: {
            upsert: {
              update: admissionsUpsertData as Prisma.CustomerAdmissionsDataUpdateInput,
              create: admissionsUpsertData,
            },
          },
        },
      })
      this.segment.identify(customer.user.id, admissionsUpsertData)
    }
  }

  private async addLikedSignUpProductsToBagItems(productIDs, customer) {
    const createManyData = []

    const customerDetails = await this.prisma.client.customerDetail.findMany({
      where: { customer: { id: customer.id } },
      select: {
        topSizes: true,
        waistSizes: true,
      },
    })

    const customerDetail = head(customerDetails)

    const productsWithPhysicalProductData = await this.prisma.client.product.findMany(
      {
        where: {
          id: { in: productIDs },
        },
        select: {
          id: true,
          type: true,
          variants: {
            select: {
              id: true,
              displayShort: true,
              reservable: true,
              physicalProducts: {
                select: {
                  id: true,
                  inventoryStatus: true,
                },
              },
            },
          },
        },
      }
    )

    for (const p of productsWithPhysicalProductData) {
      let fittingVariant
      const waistSizesToString = customerDetail.waistSizes.map(size =>
        size.toString()
      )
      if (p.type === "Top") {
        fittingVariant = p.variants.find(v =>
          customerDetail.topSizes.includes(v.displayShort)
        )
      } else if (p.type === "Bottom") {
        fittingVariant = p.variants.find(v =>
          waistSizesToString.includes(v.displayShort)
        )
      }
      const variant = fittingVariant ?? p.variants[0]
      const availablePhysicalProduct = variant.physicalProducts.find(
        pp => pp.inventoryStatus === "Reservable"
      )
      const physicalProduct =
        availablePhysicalProduct ?? variant.physicalProducts[0]

      createManyData.push({
        customerId: customer.id,
        productVariantId: variant.id,
        physicalProductId: physicalProduct.id,
        status: "Added",
        saved: true,
      })
    }

    await this.prisma.client.bagItem.createMany({
      data: createManyData,
    })
  }

  private shouldUpdateCustomerAdmissionsData(
    customer: Customer & { admissions: CustomerAdmissionsData },
    upsertData: Prisma.CustomerAdmissionsDataUpdateInput
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
