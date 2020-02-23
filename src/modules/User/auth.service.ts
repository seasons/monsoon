import { Injectable } from '@nestjs/common';
import request from "request"
import { prisma, Customer, User } from '../../prisma';
import { customer } from '../../resolvers/Mutation/customer';

@Injectable()
export class AuthService {
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
  private async getUserFromContext(ctx): Promise<User> {
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
}