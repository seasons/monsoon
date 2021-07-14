import { EmailService } from "@app/modules/Email/services/email.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { PaymentService } from "@app/modules/Payment/services/payment.service"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Inject, Injectable, Logger, forwardRef } from "@nestjs/common"
import { CustomerDetail, Location, Prisma, UTMData, User } from "@prisma/client"
import { UserPushNotificationInterestType } from "@prisma1/index"
import { PrismaService } from "@prisma1/prisma.service"
import { ForbiddenError, UserInputError } from "apollo-server"
import { defaultsDeep } from "lodash"
import { DateTime } from "luxon"
import request from "request"
import zipcodes from "zipcodes"

const PW_STRENGTH_RULES_URL =
  "https://manage.auth0.com/dashboard/us/seasons/connections/database/con_btTULQOf6kAxxbCz/security"

interface SegmentReservedTraitsInCustomerDetail {
  phone?: string
  address?: any
}

interface Auth0User {
  email: string
  family_name: string
  given_name: string
  user_id: string
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(`Auth`)

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotification: PushNotificationService,
    private readonly email: EmailService,
    private readonly error: ErrorService,
    @Inject(forwardRef(() => PaymentService))
    private readonly payment: PaymentService
  ) {}

  defaultPushNotificationInterests = [
    "General",
    "Blog",
    "Bag",
    "NewProduct",
  ] as UserPushNotificationInterestType[]

  async signupUser({
    email,
    password,
    firstName,
    lastName,
    details,
    referrerId,
    utm,
    select,
    giftId,
  }: {
    email: string
    password: string
    firstName: string
    lastName: string
    details: Prisma.CustomerDetailCreateInput
    referrerId?: string
    utm?: UTMData
    select?: any
    giftId?: string
  }) {
    // 1. Register the user on Auth0
    let userAuth0ID
    try {
      userAuth0ID = await this.createAuth0User(email.trim(), password, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })
    } catch (err) {
      if (err.message.includes("400")) {
        throw new UserInputError(err)
      }
      throw new Error(err)
    }

    // 2. Get their API access token from Auth0
    let tokenData
    try {
      tokenData = await this.getAuth0UserAccessToken(email, password)
    } catch (err) {
      if (err.message.includes("403")) {
        throw new ForbiddenError(err)
      }
      throw new UserInputError(err)
    }

    // 3. Create the user in our database
    const user = await this.createPrismaUser({
      auth0Id: userAuth0ID,
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      details,
      utm,
      referrerId,
      select,
    })

    // 4. In the case of a gift subscription
    // We will already have a subscription for that user based on email so assign it to that new customer
    if (!!giftId) {
      const giftData = await this.payment.getGift(giftId)
      const { gift, subscription } = giftData

      const nextMonth = DateTime.local().plus({ months: 1 })
      // Only create the billing info and send welcome email if user used chargebee checkout
      await this.payment.createPrismaSubscription(
        user.id,
        gift.gift_receiver.customer_id,
        {
          brand: "gift",
          name: gift.gifter.signature,
          last4: "0000",
          expiry_month: nextMonth.month,
          expiry_year: nextMonth.year,
        },
        subscription,
        giftId
      )
    }

    await this.email.sendSubmittedEmailEmail(user)

    return {
      user,
      tokenData,
      customer: user.customer,
    }
  }

  async loginUser({ email, password, requestUser, select }) {
    if (!!requestUser) {
      throw new Error(`user is already logged in`)
    }

    // Get their API access token
    let tokenData
    try {
      tokenData = await this.getAuth0UserAccessToken(email, password)
    } catch (err) {
      if (err.message.includes("403")) {
        throw new ForbiddenError(err)
      }
      throw new UserInputError(err)
    }

    const _returnUser = await this.prisma.client2.user.findUnique({
      where: { email },
      ...select.user,
    })
    const returnUser = this.prisma.sanitizePayload(_returnUser, "User")

    if (!returnUser) {
      throw new Error(`user with email ${email} not found`)
    }

    const _customer = await this.prisma.client2.customer.findFirst({
      where: {
        user: { email },
      },
      ...select.customer,
    })
    const customer = this.prisma.sanitizePayload(_customer, "Customer")

    return {
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      user: returnUser,
      customer: customer,
      beamsToken: this.pushNotification.generateToken(email),
    }
  }

  async getAuth0Users(): Promise<Auth0User[]> {
    const token = await this.getAuth0ManagementAPIToken()
    return new Promise((resolve, reject) => {
      request(
        {
          method: "Get",
          url: `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          json: true,
        },
        (error, response, body) => {
          if (error) {
            return reject(error)
          }
          if (response.statusCode !== 200) {
            return reject(
              "Invalid status code <" +
                response.statusCode +
                ">" +
                "Response: " +
                JSON.stringify(response.body)
            )
          }
          return resolve(body)
        }
      )
    })
  }

  async getCustomerFromUserID(userID: string) {
    return await this.prisma.client2.customer.findFirst({
      where: {
        user: {
          id: userID,
        },
      },
    })
  }

  async resetPassword(email) {
    return new Promise((resolve, reject) => {
      request(
        {
          method: "Post",
          url: `https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password`,
          headers: { "content-type": "application/json" },
          body: {
            client_id: `${process.env.AUTH0_CLIENTID}`,
            connection: `${process.env.AUTH0_DB_CONNECTION}`,
            email,
          },
          json: true,
        },
        async (error, response, body) => {
          if (error) {
            reject(error)
          }
          resolve({ message: body })
        }
      )
    })
  }

  extractSegmentReservedTraitsFromCustomerDetail(
    detail: CustomerDetail & { shippingAddress: Location }
  ): SegmentReservedTraitsInCustomerDetail {
    const traits = {} as any
    if (!!detail?.phoneNumber) {
      traits.phone = detail.phoneNumber.trim()
    }
    const state = detail?.shippingAddress?.state
    if (!!detail.shippingAddress) {
      traits.address = {
        city: detail.shippingAddress?.city?.trim(),
        postalCode: detail.shippingAddress?.zipCode?.trim(),
        state,
      }
      traits.state = state
    }
    return traits
  }

  async createAuth0User(
    email: string,
    password: string,
    details: {
      firstName: string
      lastName: string
    }
  ): Promise<string> {
    const { firstName, lastName } = details
    return new Promise(function CreateUserAndReturnId(resolve, reject) {
      request(
        {
          method: "POST",
          url: `https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`,
          headers: { "content-type": "application/json" },
          body: {
            given_name: firstName,
            family_name: lastName,
            email,
            password,
            client_id: `${process.env.AUTH0_CLIENTID}`,
            connection: `${process.env.AUTH0_DB_CONNECTION}`,
          },
          json: true,
        },
        function handleResponse(error, response, body) {
          // Handle a generic error
          if (error) {
            return reject(new Error(`Error creating new Auth0 user ${error}`))
          }

          // Handle 400 error
          if (response.statusCode === 400) {
            const messageFor = (bodyCode: string) => {
              switch (bodyCode) {
                case "invalid_signup":
                  return "Email already associated with an account."
                case "invalid_password":
                case "password_strength_error":
                  return `Password too weak. See password rules at ${PW_STRENGTH_RULES_URL}.`
                case "password_dictionary_error":
                  return "Password too common."
                case "password_no_user_info_error":
                  return "Password includes user info."
                default:
                  return JSON.stringify(body)
              }
            }
            return reject(
              new Error(
                `[400 ${body.code}] Error creating new Auth0 user: ${messageFor(
                  body.code
                )}`
              )
            )
          }

          // If any other error occured, expose a generic error message
          if (response.statusCode !== 200) {
            const metadata = `[${response.statusCode} ${body.code}]`
            return reject(new Error(`${metadata} ${JSON.stringify(body)}`))
          }

          // Otherwise resolve
          return resolve(body._id)
        }
      )
    })
  }

  private async getAuth0ManagementAPIToken() {
    return new Promise((resolve, reject) => {
      request(
        {
          method: "POST",
          url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
          headers: { "content-type": "application/x-www-form-urlencoded" },
          form: {
            grant_type: "client_credentials",
            client_id: process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_ID,
            client_secret: process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_SECRET,
            audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
          },
        },
        (error, response, body) => {
          if (error) return reject(error)
          if (response.statusCode !== 200) {
            return reject(response.body)
          }
          return resolve(JSON.parse(body).access_token)
        }
      )
    })
  }

  async createPrismaUser({
    auth0Id,
    email,
    firstName,
    lastName,
    details,
    referrerId,
    utm,
    select,
  }: {
    auth0Id: string
    email: string
    firstName: string
    lastName: string
    details: Prisma.CustomerDetailCreateInput
    referrerId?: string
    utm?: UTMData
    select: any
  }) {
    this.formatDetailsForCreateInput(details)

    const defaultSelect = {
      id: true,
      email: true,
      auth0Id: true,
      firstName: true,
      lastName: true,
      customer: {
        select: {
          id: true,
          status: true,
          plan: true,
          detail: {
            select: {
              id: true,
              shippingAddress: true,
            },
          },
        },
      },
    }

    const updatedSelect: typeof defaultSelect = defaultsDeep(defaultSelect, {
      customer: select?.customer,
      ...select?.user?.select,
    })

    const user = await this.prisma.client2.user.create({
      data: {
        auth0Id,
        email,
        firstName,
        lastName,
        roles: {
          create: {
            position: 1000,
            value: "Customer",
          },
        },
        pushNotification: {
          create: {
            interests: {
              create: this.defaultPushNotificationInterests.map(type => ({
                type,
                value: "",
                status: true,
              })),
            },
            status: true,
          },
        },
        customer: {
          create: {
            ...(!!utm?.source ||
            !!utm?.medium ||
            !!utm?.term ||
            !!utm?.content ||
            !!utm?.campaign
              ? { utm: { create: utm } }
              : {}),
            detail: {
              create: {
                ...details,
                insureShipment: false,
              },
            },
            admissions: {
              create: {
                allAccessEnabled: false,
                admissable: false,
                inServiceableZipcode: false,
                authorizationsCount: 0,
              },
            },
            status: "Waitlisted",
          },
        },
      },
      select: updatedSelect,
    })

    await this.updateCustomerWithReferrerData(user, user.customer, referrerId)

    return this.prisma.sanitizePayload(user, "User")
  }

  async updateCustomerWithReferrerData(user, customer, referrerId) {
    const referralLink = await this.createReferralLink(
      customer.id,
      this.rebrandlyUsernameFromFirstname(user.firstName)
    )
    let referrerIsValidCustomer = false
    if (referrerId) {
      referrerIsValidCustomer = !!(await this.prisma.client2.customer.findFirst(
        {
          where: { id: referrerId },
        }
      ))
    }

    return await this.prisma.client2.customer.update({
      where: { id: customer.id },
      data: {
        referralLink: referralLink.shortUrl,
        ...(referrerIsValidCustomer
          ? {
              referrer: {
                connect: { id: referrerId },
              },
            }
          : {}),
      },
    })
  }

  private formatDetailsForCreateInput(details) {
    if (details?.shippingAddress?.create?.zipCode) {
      const zipCode = details?.shippingAddress?.create?.zipCode.trim()
      const state = zipcodes.lookup(zipCode)?.state
      const city = zipcodes.lookup(zipCode)?.city
      details.shippingAddress.create.city = city
      details.shippingAddress.create.state = state
      details.shippingAddress.create.zipCode = zipCode
    }
    if (details?.phoneNumber) {
      details.phoneNumber = details.phoneNumber.replace(/-/g, "")
    }
  }

  private async rebrandlyUsernameFromFirstname(firstName: string) {
    const usersWithSameFirstName = await this.prisma.client2.user.findMany({
      where: { firstName: firstName.trim() },
    })

    // replace all non-aphabetical characters with an empty space so e.g "R.J." doesn't throw an error on rebrandly
    // We had to increment here by 4 after an early issue with collisions due to whitespace
    return (
      firstName.replace(/[^a-z]/gi, "") +
      (usersWithSameFirstName.length + 4).toString().toLowerCase()
    )
  }

  async createReferralLink(
    customerId,
    referralSlashTag
  ): Promise<{
    shortUrl: string
  }> {
    const baseDomain =
      process.env.NODE_ENV === "production"
        ? "www.wearseasons.com"
        : "staging.wearseasons.com"
    let linkRequest = {
      destination: `https://${baseDomain}/signup?referrer_id=` + customerId,
      domain: { fullName: process.env.REFERRAL_DOMAIN },
      slashtag: referralSlashTag,
    }

    let requestHeaders = {
      "Content-Type": "application/json",
      apikey: process.env.REBRANDLY_API_KEY,
      workspace: process.env.REBRANDLY_WORKSPACE_ID,
    }
    return new Promise((resolve, reject) => {
      return request(
        {
          uri: "https://api.rebrandly.com/v1/links",
          method: "POST",
          body: JSON.stringify(linkRequest),
          headers: requestHeaders,
        },
        (err, response, body) => {
          if (err) {
            this.error.setExtraContext({ id: customerId }, "customer")
            this.error.captureError(
              `Error with referral link: ${JSON.stringify(err)}`
            )
            reject(err)
          }
          resolve(JSON.parse(body))
        }
      )
    })
  }

  private async getAuth0UserAccessToken(
    email,
    password
  ): Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
  }> {
    return new Promise((resolve, reject) => {
      request(
        {
          method: "Post",
          url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
          headers: { "content-type": "application/json" },
          body: {
            grant_type: "password",
            username: email,
            password,
            scope: "offline_access",
            audience: `${process.env.AUTH0_AUDIENCE}`,
            client_id: `${process.env.AUTH0_CLIENTID}`,
            client_secret: `${process.env.AUTH0_CLIENT_SECRET}`,
          },
          json: true,
        },
        function handleResponse(error, response, body) {
          if (error) {
            return reject(new Error(`Error retrieving access token: ${error}`))
          }
          if (response.statusCode !== 200) {
            return reject(
              new Error(
                `Error retrieving access token from Auth0. Auth0 returned ` +
                  `${response.statusCode} with body: ${JSON.stringify(body)}`
              )
            )
          }
          return resolve(body)
        }
      )
    })
  }

  async refreshToken(refreshToken) {
    return new Promise((resolve, reject) => {
      request(
        {
          method: "Post",
          url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
          headers: { "content-type": "application/x-www-form-urlencoded" },
          form: {
            grant_type: "refresh_token",
            client_id: process.env.AUTH0_CLIENTID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            refresh_token: refreshToken,
          },
          json: true,
        },
        async (error, response, body) => {
          if (error) {
            reject(error)
          }
          resolve(body.access_token)
        }
      )
    })
  }
}
