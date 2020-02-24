import { Injectable } from '@nestjs/common';
import request from "request"
import { prisma, Customer, User, CustomerDetail } from '../../prisma';
import { customer } from '../../resolvers/Mutation/customer';

const PW_STRENGTH_RULES_URL =
  "https://manage.auth0.com/dashboard/us/seasons/connections/database/con_btTULQOf6kAxxbCz/security"

interface SegmentReservedTraitsInCustomerDetail {
  phone?: string
  address?: any
}

@Injectable()
export class AuthService {
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
    let customer
    try {
      const customerArray = await prisma.customers({
        where: { user: { id: userID } },
      })
      customer = customerArray[0]
    } catch (err) {
      throw new Error(err)
    }

    return customer
  }

  // retrieves the user indicated by the JWT token on the request.
  // If no such user exists, throws an error.
  async getUserFromContext(ctx): Promise<User> {
    if (!ctx.req.user) {
      throw new Error("no user on context")
    }

    // Does such a user exist?
    const auth0Id = ctx.req.user.sub.split("|")[1] // e.g "auth0|5da61ffdeef18b0c5f5c2c6f"
    const userExists = await prisma.$exists.user({ auth0Id })
    if (!userExists) {
      throw new Error("token does not correspond to any known user")
    }

    // User exists. Let's return
    const user = await prisma.user({ auth0Id })
    return user
  }

  async getCustomerFromContext(ctx): Promise<Customer> {
    // Get the user on the context
    const user = await this.getUserFromContext(ctx) // will throw error if user doesn't exist

    if (user.role !== "Customer") {
      throw new Error(
        `token belongs to a user of type ${user.role}, not Customer`
      )
    }


    // Get the customer record corresponding to that user
    const customerArray = await prisma.customers({
      where: { user: { id: user.id } },
    })

    return customerArray[0]
  }

  async createPrismaUser(
    auth0Id,
    email,
    firstName,
    lastName
  ) {
    const user = await prisma.createUser({
      auth0Id,
      email,
      firstName,
      lastName,
    })
    return user
  }

  async createPrismaCustomerForExistingUser(
    userID,
    details = {},
    status
  ) {
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