const Sentry = require("@sentry/node")
Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

export function createGetUserMiddleware (prisma) {
  return (req, res, next) => {
    // Get auth0 user from request
    const auth0User = req.user
    if (!auth0User) {
      return next()
    }

    // Get user from prisma
    const { sub } = auth0User
    const auth0Id = sub.split("|")[1]
    const prismaUser = prisma.user({ auth0Id })
    req.user = { ...req.user, ...prismaUser }

    // Add user context on Sentry
    Sentry.configureScope(function (scope) {
      scope.setUser({ id: prismaUser.id, email: prismaUser.email })
    })

    return next()
  }
}
