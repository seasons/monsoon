import { Injectable } from "@nestjs/common"
import request from "request"
import { prisma, CustomerDetail } from "../../../prisma"
import { head } from "lodash"
import PushNotifications from "@pusher/push-notifications-server"

const PW_STRENGTH_RULES_URL =
  "https://manage.auth0.com/dashboard/us/seasons/connections/database/con_btTULQOf6kAxxbCz/security"

interface SegmentReservedTraitsInCustomerDetail {
  phone?: string
  address?: any
}

const { PUSHER_INSTANCE_ID, PUSHER_SECRET_KEY } = process.env

@Injectable()
export class AuthService {
  beamsClient: PushNotifications | null =
  PUSHER_INSTANCE_ID && PUSHER_SECRET_KEY
    ? new PushNotifications({
        instanceId: PUSHER_INSTANCE_ID,
        secretKey: PUSHER_SECRET_KEY,
      })
    : null

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
      await prisma.customers({
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
    const user = await prisma.createUser({
      auth0Id,
      email,
      firstName,
      lastName,
    })
    return user
  }

  async createPrismaCustomerForExistingUser(userID, details = {}, status) {
    const customer = await prisma.createCustomer({
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
    const traits = {}
    if (!!detail.phoneNumber) {
      traits["phone"] = detail.phoneNumber
    }
    return traits
  }
}
