import { ApplicationType } from "@app/decorators/application.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { Customer } from "@app/prisma/prisma.binding"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Injectable } from "@nestjs/common"
import {
  BillingInfoUpdateDataInput,
  CustomerAdmissionsDataCreateWithoutCustomerInput,
  CustomerAdmissionsDataWhereUniqueInput,
  CustomerStatus,
  CustomerUpdateInput,
  CustomerWhereUniqueInput,
  ID_Input,
  InAdmissableReason,
  User,
} from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import * as Sentry from "@sentry/node"
import { ApolloError } from "apollo-server"
import { pick } from "lodash"

import { AdmissionsService, TriageFuncResult } from "./admissions.service"
import { AuthService } from "./auth.service"

type TriageCustomerStatusResult = "Waitlisted" | "Authorized"

type TriageCustomerResult = {
  status: TriageCustomerStatusResult
  waitlistReason?: InAdmissableReason
}

type UpdateCustomerAdmissionsDataInput = TriageCustomerResult & {
  customer: Customer
  dryRun: boolean
  inServiceableZipcode?: boolean
}

@Injectable()
export class CustomerService {
  triageCustomerInfo = `{
    id
    status
    detail {
      shippingAddress {
        zipCode
      }
      topSizes
      waistSizes
    }
    user {
      id
      firstName
      lastName
      email
      emails {
        emailId
      }
    }
    admissions {
      authorizationsCount
    }
  }`

  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
    private readonly shipping: ShippingService,
    private readonly admissions: AdmissionsService,
    private readonly segment: SegmentService,
    private readonly email: EmailService,
    private readonly pushNotification: PushNotificationService,
    private readonly sms: SMSService
  ) {}

  async setCustomerPrismaStatus(user: User, status: CustomerStatus) {
    const customer = await this.auth.getCustomerFromUserID(user.id)
    await this.prisma.client.updateCustomer({
      data: { status },
      where: { id: customer.id },
    })
  }

  async addCustomerDetails({ details, status }, customer, user, info) {
    // If any of these keys is present, the entire address must be present and valid.
    const groupedKeys = ["name", "address1", "address2", "city", "state"]
    if (
      details.shippingAddress?.create &&
      Object.keys(details.shippingAddress?.create)?.some(key =>
        groupedKeys.includes(key)
      )
    ) {
      const {
        name,
        address1: street1,
        city,
        state,
        zipCode: zip,
      } = details.shippingAddress.create
      if (!(name && street1 && city && state && zip)) {
        throw new Error(
          "Missing a required field. Expected name, address1, city, state, and zipCode."
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
    }

    await this.prisma.client.updateCustomer({
      data: {
        detail: {
          upsert: {
            update: details,
            create: details,
          },
        },
      },
      where: { id: customer.id },
    })

    // If a status was passed, update the customer status in prisma
    if (!!status) {
      await this.setCustomerPrismaStatus(user, status)
    }

    // Return the updated customer object
    return await this.prisma.binding.query.customer(
      { where: { id: customer.id } },
      info
    )
  }

  async updateCustomerDetail(user, customer, shippingAddress, phoneNumber) {
    const {
      city: shippingCity,
      postalCode: shippingPostalCode,
      state: shippingState,
      street1: shippingStreet1,
      street2: shippingStreet2,
    } = shippingAddress
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
    const detailID = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .id()
    const shippingAddressData = {
      slug: `${user.firstName}-${user.lastName}-shipping-address`,
      name: `${user.firstName} ${user.lastName}`,
      city: shippingCity,
      zipCode: shippingPostalCode,
      state: shippingState,
      address1: shippingStreet1,
      address2: shippingStreet2,
    }
    if (detailID) {
      const shippingAddressID = await this.prisma.client
        .customer({ id: customer.id })
        .detail()
        .shippingAddress()
        .id()
      const shippingAddress = await this.prisma.client.upsertLocation({
        create: shippingAddressData,
        update: shippingAddressData,
        where: { id: shippingAddressID },
      })
      if (shippingAddress) {
        await this.prisma.client.updateCustomerDetail({
          data: {
            phoneNumber,
            shippingAddress: { connect: { id: shippingAddress.id } },
          },
          where: { id: detailID },
        })
      }
    } else {
      await this.prisma.client.updateCustomer({
        data: {
          detail: {
            create: {
              phoneNumber,
              shippingAddress: {
                create: shippingAddressData,
              },
            },
          },
        },
        where: { id: customer.id },
      })
    }

    return await this.prisma.client.customer({ id: customer.id })
  }

  async updateCustomerBillingInfo({
    billingInfo,
    customerId,
  }: {
    billingInfo: BillingInfoUpdateDataInput
    customerId: ID_Input
  }) {
    const billingInfoId = await this.prisma.client
      .customer({ id: customerId })
      .billingInfo()
      .id()
    if (billingInfoId) {
      await this.prisma.client.updateBillingInfo({
        data: billingInfo,
        where: { id: billingInfoId },
      })
    }
  }

  async updateCustomer(args, info, application: ApplicationType) {
    let { where, data, withContact = true } = args
    const customer = await this.prisma.binding.query.customer(
      {
        where,
      },
      `{
        id
        user {
          id
          email
          emails {
            emailId
          }
          firstName
          lastName
        }
        detail {
          shippingAddress {
            zipCode
          }
        }
        status
        admissions {
          authorizationsCount
        }
      }`
    )

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

      const { pass: inServiceableZipcode } = this.admissions.zipcodeAllowed(
        customer.detail.shippingAddress.zipCode
      )

      if (!inServiceableZipcode) {
        throw new Error(`Can not authorize user. In nonserviceable zipcode`)
      }

      data = {
        ...data,
        authorizedAt: new Date(),
        admissions: {
          upsert: {
            create: {
              admissable: true,
              inServiceableZipcode: true,
              authorizationsCount: this.calculateNumAuthorizations(
                customer,
                data.status,
                false
              ),
            },
            update: {
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
          await this.email.sendAuthorizedEmail(
            customer.user as User,
            "manual",
            [...availableBottomStyles, ...availableTopStyles]
          )
        }
        // Users we invited off the admin
        if (customer.status === "Invited") {
          await this.email.sendPriorityAccessEmail(customer.user as User)
        }

        // either kind of user
        await this.pushNotification.pushNotifyUser({
          email: customer.user.email,
          pushNotifID: "CompleteAccount",
        })
        await this.sms.sendSMSById({
          to: { id: customer.user.id },
          renderData: { name: customer.user.firstName },
          smsId: "CompleteAccount",
        })
      }

      this.segment.trackBecameAuthorized(customer.user.id, {
        previousStatus: customer.status,
        firstName: customer.user.firstName,
        lastName: customer.user.lastName,
        email: customer.user.email,
        method: "Manual",
        application,
      })
    }
    return this.prisma.binding.mutation.updateCustomer({ where, data }, info)
  }

  async triageCustomer(
    where: CustomerWhereUniqueInput,
    application: ApplicationType,
    dryRun: boolean,
    customer: Customer = {} as Customer
  ): Promise<TriageCustomerResult> {
    if (Object.keys(customer).length === 0) {
      customer = await this.prisma.binding.query.customer(
        { where },
        this.triageCustomerInfo
      )
    }

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
          this.admissions.hasSupportedPlatform(where, application),
        waitlistReason: "UnsupportedPlatform",
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
    try {
      for (const { func, waitlistReason } of triageFuncs) {
        const { pass, detail } = await func()

        // Store the result of the serviceable zipcode lookup to store it
        // on the customer later
        if (waitlistReason === "UnserviceableZipcode") {
          inServiceableZipcode = pass
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
          previousStatus: customer.status,
          firstName: customer.user.firstName,
          lastName: customer.user.lastName,
          email: customer.user.email,
          method: "Automatic",
          application,
        })

        await this.email.sendAuthorizedEmail(
          customer.user as User,
          "automatic",
          availableStyles
        )
      } else {
        await this.email.sendWaitlistedEmail(customer.user as User)
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
      dryRun,
    })

    return { status, waitlistReason: reason }
  }

  private async updateCustomerAfterTriage({
    customer,
    status,
    waitlistReason,
    inServiceableZipcode,
    dryRun,
  }: UpdateCustomerAdmissionsDataInput) {
    let data: CustomerUpdateInput = {}
    let admissionsUpsertData = {} as CustomerAdmissionsDataCreateWithoutCustomerInput

    if (!dryRun) {
      data = { status }
    }
    switch (status) {
      case "Authorized":
        if (!dryRun) {
          data.authorizedAt = new Date()
        }
        admissionsUpsertData = {
          admissable: true,
          inServiceableZipcode: true,
          authorizationsCount: this.calculateNumAuthorizations(
            customer,
            status,
            dryRun
          ),
        }
        break
      case "Waitlisted":
        if (inServiceableZipcode === undefined) {
          ;({ pass: inServiceableZipcode } = this.admissions.zipcodeAllowed(
            customer.detail?.shippingAddress?.zipCode
          ))
        }
        // Handle the inserviceableZipcode
        admissionsUpsertData = {
          admissable: false,
          inServiceableZipcode,
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
      await this.prisma.client.updateCustomer({
        where: { id: customer.id },
        data: {
          ...data,
          admissions: {
            upsert: {
              update: admissionsUpsertData,
              create: admissionsUpsertData,
            },
          },
        },
      })
      this.segment.identify(customer.user.id, admissionsUpsertData)
    }
  }

  private shouldUpdateCustomerAdmissionsData(
    customer: Customer,
    upsertData: CustomerAdmissionsDataCreateWithoutCustomerInput
  ) {
    return (
      customer?.admissions?.admissable !== upsertData.admissable ||
      customer?.admissions?.authorizationsCount !==
        upsertData.authorizationsCount ||
      customer?.admissions?.inAdmissableReason !==
        upsertData.inAdmissableReason ||
      customer?.admissions?.inServiceableZipcode !==
        upsertData.inServiceableZipcode
    )
  }

  /* Start here */
  private calculateNumAuthorizations(
    customer: Customer,
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
