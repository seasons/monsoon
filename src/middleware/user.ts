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
    return prisma.user({ auth0Id }).then(prismaUser => {
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
        }
      } catch (e) {
        console.error(e)
      }
      return next()
    })
  }
}
