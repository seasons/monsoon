import { EmailService } from "@app/modules/Email/services/email.service"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { CustomerDetail } from "@app/prisma/prisma.binding"
import { Injectable } from "@nestjs/common"
import {
  CustomerDetailCreateInput,
  UserPushNotificationInterestType,
} from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { ForbiddenError, UserInputError } from "apollo-server"
import { head } from "lodash"
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotification: PushNotificationService,
    private readonly email: EmailService
  ) {}

  async signupUser({
    email,
    password,
    firstName,
    lastName,
    details,
  }: {
    email: string
    password: string
    firstName: string
    lastName: string
    details: CustomerDetailCreateInput
  }) {
    // 1. Register the user on Auth0
    let userAuth0ID
    try {
      userAuth0ID = await this.createAuth0User(email, password, {
        firstName,
        lastName,
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
    const user = await this.createPrismaUser(
      userAuth0ID,
      email,
      firstName,
      lastName
    )

    // There will be a race condition in the case where two members with the same first name sign up at the same time
    const usersWithSameFirstName = await this.prisma.client.users({
      where: { firstName },
    })

    // 4. Create the customer in our database
    const customer = await this.createPrismaCustomerForExistingUser(
      user.id,
      details,
      "Created",
      firstName + usersWithSameFirstName.length.toString()
    )

    await this.email.sendSubmittedEmailEmail(user)

    return { user, tokenData, customer }
  }

  async loginUser({ email, password, requestUser }) {
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

    const user = await this.prisma.client.user({ email })

    // If the user is a Customer, make sure that the account has been approved
    if (!user) {
      throw new Error("User record not found")
    }

    return {
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      user,
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
    return head(
      await this.prisma.client.customers({
        where: { user: { id: userID } },
      })
    )
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
    detail: CustomerDetail
  ): SegmentReservedTraitsInCustomerDetail {
    const traits = {} as any
    if (!!detail?.phoneNumber) {
      traits.phone = detail.phoneNumber
    }
    const state = detail?.shippingAddress?.state
    if (!!detail.shippingAddress) {
      traits.address = {
        city: detail.shippingAddress?.city,
        postalCode: detail.shippingAddress?.zipCode,
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
          method: "Post",
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

  private async createPrismaUser(auth0Id, email, firstName, lastName) {
    let user = await this.prisma.client.createUser({
      auth0Id,
      email,
      firstName,
      lastName,
      roles: { set: ["Customer"] }, // defaults to customer
    })
    const defaultPushNotificationInterests = [
      "General",
      "Blog",
      "Bag",
      "NewProduct",
    ] as UserPushNotificationInterestType[]
    user = await this.prisma.client.updateUser({
      where: { id: user.id },
      data: {
        pushNotification: {
          create: {
            interests: {
              create: defaultPushNotificationInterests.map(type => ({
                type,
                value: "",
                user: { connect: { id: user.id } },
                status: true,
              })),
            },
            status: true,
          },
        },
      },
    })
    return user
  }

  private async createPrismaCustomerForExistingUser(
    userID,
    details,
    status,
    referralSlashTag
  ) {
    if (details?.shippingAddress?.create?.zipCode) {
      const zipCode = details?.shippingAddress?.create?.zipCode
      const state = zipcodes.lookup(zipCode)?.state
      const city = zipcodes.lookup(zipCode)?.city
      details.shippingAddress.create.city = city
      details.shippingAddress.create.state = state
    }

    const newCustomer = await this.prisma.binding.mutation.createCustomer(
      {
        data: {
          user: {
            connect: { id: userID },
          },
          detail: { create: details },
          status: status || "Waitlisted",
        },
      },
      `{
      id
      status
      detail {
        shippingAddress {
          zipCode
          state
          city
        }
      }
    }`
    )

    // Don't want to await on this
    this.createReferralLink(newCustomer.id, referralSlashTag)
    return newCustomer
  }

  private async createReferralLink(customerId, referralSlashTag) {
    let linkRequest = {
      destination:
        "https://www.seasons.nyc/signup?referral_id=" + referralSlashTag,
      domain: { fullName: "szns.co" },
      slashtag: referralSlashTag,
    }

    let requestHeaders = {
      "Content-Type": "application/json",
      apikey: process.env.REBRANDLY_API_KEY,
      workspace: process.env.REBRANDLY_WORKSPACE_ID,
    }

    request(
      {
        uri: "https://api.rebrandly.com/v1/links",
        method: "POST",
        body: JSON.stringify(linkRequest),
        headers: requestHeaders,
      },
      (err, response, body) => {
        let link = JSON.parse(body)
        this.prisma.binding.mutation.updateCustomer({
          data: { referralLink: link.shortUrl },
          where: { id: customerId },
        })
      }
    )
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
