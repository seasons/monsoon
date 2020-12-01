import rawCors from "cors"

import { Prisma } from "../prisma"

const STATIC_ORIGINS =
  process.env.NODE_ENV === "production"
    ? [
        /spring-staging\.herokuapp\.com/,
        /seedling-staging\.herokuapp\.com/,
        /flare\.now\.sh$/,
        /seasons\.nyc$/,
        /wearseasons\.com$/,
        /vercel\.app/,
        /shopifypreview\.com/,
      ]
    : [
        /spring-staging\.herokuapp\.com/,
        /seedling-staging\.herokuapp\.com/,
        /flare\.now\.sh$/,
        /seasons\.nyc$/,
        /wearseasons\.com$/,
        /localhost/,
        /vercel\.app/,
        /shopifypreview\.com/,
        /null/, // requests from file:// URIs
      ]

export const cors = (prisma: Prisma) =>
  rawCors(async (req, callback) => {
    const origin = req.header("Origin")
    const staticMatch = STATIC_ORIGINS.some(regex => regex.test(origin))

    if (staticMatch) {
      callback(null, { origin: true, credentials: true })
      return
    }

    /**
     * If not a a static match, ensure at least one product has an externalURL origin matching the request origin.
     * The "Try With Seasons" widget on a third-party host will issue requests that we want to allow.
     */
    try {
      const products = await prisma.products({
        where: {
          externalURL_starts_with: origin,
        },
      })

      if (products && products.length > 0) {
        callback(null, { origin: true, credentials: true })
        return
      }
    } catch (_err) {
      /** noop **/
    }

    callback(null, { origin: false })
  })
