import {
    createPrismaCustomerForExistingUser,
    createAuth0User,
    createPrismaUser,
    getAuth0UserAccessToken,
    isLoggedIn,
} from "../../auth/utils"
import { Context } from "../../utils"
import { UserInputError, ForbiddenError } from "apollo-server"
import { createOrUpdateAirtableUser } from "../../airtable/createOrUpdateUser"

export const auth = {
    // The signup mutation signs up users with a "Customer" role.
    async signup(
        obj,
        { email, password, firstName, lastName, details },
        ctx: Context,
        info
    ) {
        // Register the user on Auth0
        let userAuth0ID
        try {
            userAuth0ID = await createAuth0User(email, password, {
                firstName,
                lastName,
            })
        } catch (err) {
            if (err.message.includes("400")) {
                throw new UserInputError(err)
            }
            throw new Error(err)
        }

        // Get their API access token
        let tokenData
        try {
            tokenData = await getAuth0UserAccessToken(email, password)
        } catch (err) {
            if (err.message.includes("403")) {
                throw new ForbiddenError(err)
            }
            throw new UserInputError(err)
        }

        // Create a user object in our database
        let user
        try {
            user = await createPrismaUser(ctx, {
                auth0Id: userAuth0ID,
                email,
                firstName,
                lastName,
            })
        } catch (err) {
            throw new Error(err)
        }

        // Create a customer object in our database
        let customer
        try {
            customer = await createPrismaCustomerForExistingUser(ctx, {
                userID: user.id,
                details,
                status: "Waitlisted",
            })
        } catch (err) {
            throw new Error(err)
        }

        // Insert them into airtable
        createOrUpdateAirtableUser(user, details, "Waitlisted")

        return {
            token: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
            user: user,
        }
    },

    async login(obj, { email, password }, ctx: Context, info) {
        // If they are already logged in, throw an error
        if (isLoggedIn(ctx)) {
            throw new Error(`user is already logged in`)
        }

        // Get their API access token
        let tokenData
        try {
            tokenData = await getAuth0UserAccessToken(email, password)
        } catch (err) {
            if (err.message.includes("403")) {
                throw new ForbiddenError(err)
            }
            throw new UserInputError(err)
        }

        // Get user with this email
        let user = await ctx.prisma.user({ email })

        return {
            token: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
            user,
        }
    },
}
