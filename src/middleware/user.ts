import { PrismaClient } from "@prisma/client"
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

export function createGetUserMiddleware(prisma: PrismaClient, logger) {
  return (req, res, next) => {
    const overrideAuth = req.headers["override-auth"]
    const overrideAuthToken = req.headers["override-auth-token"]

    // If we're not on staging, allow the client to override authentication
    if (
      process.env.NODE_ENV !== "production" &&
      overrideAuthToken === process.env.OVERRIDE_AUTH_TOKEN &&
      !!overrideAuth
    ) {
      // get the user email from the header
      const email = overrideAuth

      return prisma.user.findUnique({ where: { email } }).then(prismaUser => {
        req.user = { ...prismaUser }
        return next()
      })
    }

    // Get auth0 user from request
    const auth0User = req.user
    if (!auth0User) {
      return next()
    }

    // Get user from prisma
    const { sub } = auth0User
    const auth0Id = sub.split("|")[1]
    return prisma.user.findUnique({ where: { auth0Id } }).then(prismaUser => {
      if (!prismaUser && process.env.NODE_ENV !== "production") {
        // In some scenarios, the email/PW entered resolves to a user
        // on auth0, but not in prisma. Mostly for staging/local. In that
        // case, we want to reset the user object to null so it's as if
        // the user was not able to login with their credentials
        // Only do it on prod for now until we're sure this doesn't break stuff
        req.user = null
        return next()
      }

      req.user = { ...req.user, ...prismaUser }
      try {
        // Add user context on Sentry
        if (prismaUser) {
          Sentry.configureScope(scope => {
            scope.setUser({ id: prismaUser.id, email: prismaUser.email })
          })

          logger.setContext({ id: prismaUser.id, email: prismaUser.email })
        }
      } catch (e) {
        console.error(e)
        logger.error(e)
        logger.setContext({ id: prismaUser.id, email: prismaUser.email })
      }
      return next()
    })
  }
}
