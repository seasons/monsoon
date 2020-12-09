import cors from "cors"
import { uniq } from "lodash"

import { Prisma } from "../prisma"

const commonStaticOrigins = [
  /staging\.wearseasons\.com$/,
  /spring-staging\.herokuapp\.com/,
  /flare\.now\.sh$/,
  /seasons\.nyc$/,
  /wearseasons\.com$/,
  /staging\.wearseasons\.com$/,
  /vercel\.app/,
  /shopifypreview\.com/,
]

const STATIC_ORIGINS =
  process.env.NODE_ENV === "production"
    ? commonStaticOrigins
    : [
        ...commonStaticOrigins,
        /localhost/,
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
