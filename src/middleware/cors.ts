import { SmartPrismaClient } from "@app/prisma/prisma.service"
import cors from "cors"
import { uniq } from "lodash"

const commonStaticOrigins = [
  /staging\.wearseasons\.com$/,
  /spring-staging\.herokuapp\.com/,
  /flare\.now\.sh$/,
  /seasons\.nyc$/,
  /wearseasons\.com$/,
  /vercel\.app/,
  /shopifypreview\.com/,
  /studio\.apollographql\.com/,
]

const STATIC_ORIGINS =
  process.env.NODE_ENV === "production"
    ? commonStaticOrigins
    : [
        ...commonStaticOrigins,
        /localhost/,
        /null/, // requests from file:// URIs
      ]

export const createCorsMiddleware = async (prisma: SmartPrismaClient) => {
  const productsWithExternalURLs = await prisma.product.findMany({
    where: { externalURL: { not: "" } },
    select: { externalURL: true },
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
