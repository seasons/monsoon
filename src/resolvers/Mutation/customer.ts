import { Context, setCustomerPrismaStatus, sendTransactionalEmail } from "../../utils"
import {
    getCustomerFromContext,
    getUserFromContext,
    getUserId,
} from "../../auth/utils"
import { UserInputError } from "apollo-server"
import chargebee from "chargebee"
import { createOrUpdateAirtableUser } from "../../airtable/createOrUpdateUser"
import sgMail from "@sendgrid/mail"
import { User, ProductUpdateDataInput } from "../../prisma"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEE_API_KEY,
})

export const customer = {
    /*
        Test Cases for addCustomerDetails resolver:
        IF user submits an 'id' field in the resolver inputs, they get an error. 
    
        IF there is no value for the Authorization header, THEN they get a 401. 
    
        IF they use a token for an admin, THEN they get a 401
    
        IF they use a token for a partner, THEN they get a 401
    
        IF they add details to a customer with no existing customerDetail record, 
        THEN a new record is created 
        AND the customer record's "detail" field has the id of the newly created customerDetail record
    
        IF they add details to a customer with an existing details object
        THEN the existing record is updated, with any fields that were previously
        written to overwritten if the payload includes values for them. 
        */
    async addCustomerDetails(obj, { details, status }, ctx: Context, info) {
        // They should not have included any "id" in the input
        if (details.id != null) {
            throw new UserInputError("payload should not include id")
        }

        // Grab the customer off the context
        const user = await getUserFromContext(ctx)
        const customer = await getCustomerFromContext(ctx)

        // Add the details. If necessary, create the details object afresh.
        let updatedDetails
        let currentCustomerDetail = await ctx.prisma
            .customer({ id: customer.id })
            .detail()
        if (currentCustomerDetail == null) {
            await ctx.prisma.updateCustomer({
                data: { detail: { create: details } },
                where: { id: customer.id },
            })
            updatedDetails = await ctx.prisma.customer({ id: customer.id }).detail()
        } else {
            updatedDetails = await ctx.prisma.updateCustomerDetail({
                data: details,
                where: { id: currentCustomerDetail.id },
            })
        }

        // If a status was passed, update the customer status in prisma
        if (!!status) {
            await setCustomerPrismaStatus(ctx.prisma, user, status)
        }

        // Sync with airtable
        await createOrUpdateAirtableUser(user, {
            ...currentCustomerDetail,
            ...details,
            status,
        })

        // Return the updated customer object
        return { ...customer, detail: updatedDetails }
    },

    async acknowledgeCompletedChargebeeHostedCheckout(
        obj,
        { hostedPageID },
        ctx: Context,
        info
    ) {
        try {
            await chargebee.hosted_page
                .acknowledge(hostedPageID)
                .request(async function (error, result) {
                    if (error) {
                        throw error
                    } else {
                        var {
                            subscription: { customer_id },
                        } = result.hosted_page.content
                        let prismaUser = await ctx.prisma.user({ id: customer_id })
                        await setCustomerPrismaStatus(ctx.prisma, prismaUser, "Active")
                        await createOrUpdateAirtableUser(prismaUser, {}, "Active")
                        sendWelcomeToSeasonsEmail(prismaUser)
                    }
                })
        } catch (err) {
            throw err
        }
        return true
    },

    async saveProduct(obj, { item, save }, ctx: Context, info) {
        const customer = await getCustomerFromContext(ctx)

        let updatedSavedProducts

        let key = save ? "connect" : "disconnect"

        await ctx.prisma.updateCustomer({
            where: {
                id: customer.id,
            },
            data: {
                savedProducts: {
                    [key]: [{ id: item }],
                },
            },
        })

        return { ...customer, savedProduct: updatedSavedProducts }
    },

    async saveCustomerBillingInfo(obj, args, ctx: Context, info) {
        // Get the customer's id
        const { id } = await getUserId(ctx)
        const prismaCustomer = await getCustomerFromContext(ctx)
        // Retrieve all the relevant data
        let billingInfo, plan, planInfo
        await chargebee.subscription
            .list({
                limit: 1,
                "customer_id[is]": id,
            })
            .request(async function (error, result) {
                if (error) {
                    throw new Error(error)
                } else {
                    const subscription = result.list[0].subscription
                    const chargebeeCustomer = result.list[0].customer
                    const card = result.list[0].card

                    // Store all the relevant data
                    if (subscription.plan_id == "essential") {
                        plan = "Essential"
                    } else if (subscription.plan_id == "all-access") {
                        plan = "AllAccess"
                    } else {
                        throw new Error(`unexpected plan-id: ${subscription.plan_id}`)
                    }
                    billingInfo = {
                        brand: card.card_type,
                        name: `${card.first_name} ${card.last_name}`,
                        last_digits: card.last4,
                        expiration_month: card.expiry_month,
                        expiration_year: card.expiry_year,
                        street1: chargebeeCustomer.billing_address.line1,
                        street2: chargebeeCustomer.billing_address.line2,
                        city: chargebeeCustomer.billing_address.city,
                        state: chargebeeCustomer.billing_address.state,
                        country: chargebeeCustomer.billing_address.country,
                        postal_code: chargebeeCustomer.billing_address.zip,
                    }
                    await ctx.prisma.updateCustomer({
                        data: {
                            plan: plan,
                            billingInfo: {
                                upsert: {
                                    create: billingInfo,
                                    update: billingInfo,
                                },
                            },
                        },
                        where: { id: prismaCustomer.id },
                    })
                }
            })

        return {
            billingInfo: ctx.prisma.customer({ id: prismaCustomer.id }).billingInfo(),
            plan: ctx.prisma.customer({ id: prismaCustomer.id }).plan(),
        }
    },
}

function sendWelcomeToSeasonsEmail(user: User) {
    sendTransactionalEmail(user.email, "d-05ae098e5bfb47eb9372ea2c461ffcf6", {
      name: user.firstName,
    })
}
