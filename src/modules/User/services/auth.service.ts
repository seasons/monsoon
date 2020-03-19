import { Injectable } from "@nestjs/common"
import request from "request"
import { CustomerDetail, CustomerDetailCreateInput } from "../../../prisma"
import { head } from "lodash"
import PushNotifications from "@pusher/push-notifications-server"
import { PrismaClientService } from "../../../prisma/client.service"
import { UserInputError, ForbiddenError } from "apollo-server"
import { AirtableService } from "../../Airtable/services/airtable.service"

const PW_STRENGTH_RULES_URL =
  "https://manage.auth0.com/dashboard/us/seasons/connections/database/con_btTULQOf6kAxxbCz/security"

interface SegmentReservedTraitsInCustomerDetail {
  phone?: string
  address?: any
}

@Injectable()
export class AuthService {
  beamsClient: PushNotifications | null = _instantiateBeamsClient()

  constructor(
    private readonly prismaService: PrismaClientService,
    private readonly airtable: AirtableService
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
    // Register the user on Auth0
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

    // Create a user object in our database
    let user
    try {
      user = await this.createPrismaUser(
        userAuth0ID,
        email,
        firstName,
        lastName
      )
    } catch (err) {
      throw new Error(err)
    }

    // Create a customer object in our database
    try {
      await this.createPrismaCustomerForExistingUser(
        user.id,
        details,
        "Created"
      )
    } catch (err) {
      throw new Error(err)
    }

    // Insert them into airtable
    this.airtable.createOrUpdateAirtableUser(user, {
      ...details,
      status: "Created",
    })

    return { user, tokenData }
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
            return reject(new Error(`Error creating Auth0 user: ${error}`))
          }
          // Give a precise error message if a user tried to sign up with an
          // email that's already in the db
          if (response.statusCode == 400 && body.code === "invalid_signup") {
            return reject(new Error("400 -- email already in db"))
          }
          // Give a precise error message if a user tried to sign up with
          // a insufficiently strong password
          if (
            response.statusCode == 400 &&
            body.name === "PasswordStrengthError"
          ) {
            return reject(
              new Error(
                `400 -- insufficiently strong password. see pw rules at ${PW_STRENGTH_RULES_URL}`
              )
            )
          }
          // If any other error occured, expose a generic error message
          if (response.statusCode != 200) {
            return reject(
              new Error(
                `Error creating new Auth0 user. Auth0 returned ` +
                  `${response.statusCode} with body: ${JSON.stringify(body)}`
              )
            )
          }
          return resolve(body._id)
        }
      )
    })
  }

  async getAuth0UserAccessToken(
    email,
    password
  ): Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
  }> {
    return new Promise(function RetrieveAccessToken(resolve, reject) {
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

  async getCustomerFromUserID(userID: string) {
    return head(
      await this.prismaService.client.customers({
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

  async createPrismaUser(auth0Id, email, firstName, lastName) {
    const user = await this.prismaService.client.createUser({
      auth0Id,
      email,
      firstName,
      lastName,
    })
    return user
  }

  async createPrismaCustomerForExistingUser(userID, details = {}, status) {
    const customer = await this.prismaService.client.createCustomer({
      user: {
        connect: { id: userID },
      },
      detail: { create: details },
      status: status || "Waitlisted",
    })

    // TODO: update airtable with customer data

    return customer
  }

  extractSegmentReservedTraitsFromCustomerDetail(
    detail: CustomerDetail
  ): SegmentReservedTraitsInCustomerDetail {
    const traits = {} as any
    if (!!detail?.phoneNumber) {
      traits.phone = detail.phoneNumber
    }
    return traits
  }
}

const _instantiateBeamsClient = () => {
  const { PUSHER_INSTANCE_ID, PUSHER_SECRET_KEY } = process.env

  return PUSHER_INSTANCE_ID && PUSHER_SECRET_KEY
    ? new PushNotifications({
        instanceId: PUSHER_INSTANCE_ID,
        secretKey: PUSHER_SECRET_KEY,
      })
    : null
}
