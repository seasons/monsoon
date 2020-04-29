const Sentry = require("@sentry/node")
Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

export function createGetUserMiddleware(prisma) {
  return (req, res, next) => {
    // Get auth0 user from request
    const auth0User = req.user
    if (!auth0User) {
      return next()
    }

    // Get user from prisma
    const { sub } = auth0User
    const auth0Id = sub.split("|")[1]
    prisma.user({ auth0Id }).then(prismaUser => {
      req.user = { ...req.user, ...prismaUser }

      try {
        // Add user context on Sentry
        if (prismaUser) {
          Sentry.configureScope(scope => {
            scope.setUser({ id: prismaUser.id, email: prismaUser.email })
          })
        }
      } catch (e) {
        console.error(e)
      }

      return next()
    })
  }
}
