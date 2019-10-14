// using a user's auth0 token, retrieves their data from postgres 
// and populates the user object on the request.
export const getUser = async (req, res, next, db) => {
    if (!req.user) return next()
    const user = await db.query.user({
        where: { auth0id: req.user.sub.split(`|`)[1] },
    })
    req.user = { token: req.user, ...user }
    next()
}
