import crypto from "crypto"
import util from "util"

import { Injectable } from "@nestjs/common"
import request from "request"

import { PrismaService } from "../../../prisma/prisma.service"

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET_KEY,
  SHOPIFY_APP_NONCE,
} = process.env

const VALID_SHOPIFY_HOSTNAME = /\A(https|http)\:\/\/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com\//

type AccessToken = {
  accessToken: string
  scope: string
}

@Injectable()
export class ShopifyService {
  constructor(private readonly prisma: PrismaService) {}

  isValidAuthorizationCode({
    authorizationCode,
    hmac,
    timestamp,
    nonce,
    shop,
  }: {
    authorizationCode: string
    hmac: string
    timestamp: string
    nonce: string
    shop: string
  }) {
    const queryWithoutHmac = `code=${authorizationCode}&shop=${shop}&state=${nonce}&timestamp=${timestamp}`
    const ownHmac = crypto
      .createHmac("sha256", SHOPIFY_API_SECRET_KEY)
      .update(queryWithoutHmac)
      .digest("hex")

    return (
      nonce === SHOPIFY_APP_NONCE &&
      VALID_SHOPIFY_HOSTNAME.test(shop) &&
      ownHmac === hmac
    )
  }

  async getAccessToken({
    shop,
    accessCode,
  }: {
    shop: string
    accessCode: string
  }): Promise<AccessToken> {
    return new Promise((resolve, reject) => {
      request(
        {
          uri: `https://${shop}.myshopify.com/admin/oauth/access_token`,
          method: "POST",
          body: {
            client_id: SHOPIFY_API_KEY,
            client_secret: SHOPIFY_API_SECRET_KEY,
            code: accessCode,
          },
          json: true,
        },
        (err, response) => {
          if (err) {
            return reject(err)
          }
          return resolve(response.toJSON().body)
        }
      )
    })
  }
}
