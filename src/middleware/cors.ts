import cors from "cors"
import { uniq } from "lodash"

import { Prisma } from "../prisma"

const STATIC_ORIGINS =
  process.env.NODE_ENV === "production"
    ? [
        /spring-staging\.herokuapp\.com/,
        /seedling-staging\.herokuapp\.com/,
        /flare\.now\.sh$/,
        /seasons\.nyc$/,
        /wearseasons\.com$/,
        /staging\.wearseasons\.com$/,
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

export const createCorsMiddleware = async (prisma: Prisma) => {
  const productsWithExternalURLs = await prisma.products({
    where: { externalURL_not: "" },
  })
  const uniqueExternalOrigins = uniq(
    productsWithExternalURLs
      .map(p => {
        try {
          return new URL(p.externalURL).origin
        } catch (_err) {
          return null
        }
      })
      .filter(Boolean)
  )
  const originAllowList = [...STATIC_ORIGINS, ...uniqueExternalOrigins]

  return cors({
    origin: originAllowList,
    credentials: true,
  })
}
