import sgMail from "@sendgrid/mail"

import { getAllUsers } from "./airtable/utils"
import { prisma, User } from "./prisma"
import { getCustomerFromUserID, setCustomerPrismaStatus, sendTransactionalEmail, getUserIDHash } from "./utils"
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
module.exports.checkAndAuthorizeUsers = async (event, context, callback) => {
    // Retrieve emails and statuses of every user on the airtable DB
    const allAirtableUsers = await getAllUsers()
    for (let airtableUser of allAirtableUsers) {
        if (airtableUser.fields.Status === "Authorized") {
            console.log(airtableUser)
            console.log(airtableUser.model.email)
            const prismaUser = await prisma.user({ email: airtableUser.model.email })
            console.log(prismaUser)
            if (!prismaUser) {
                continue
            }
            const prismaCustomer = await getCustomerFromUserID(prisma, prismaUser.id)
            const prismaCustomerStatus = await prisma.customer({ id: prismaCustomer.id }).status()
            if (prismaCustomerStatus !== "Authorized") {
                setCustomerPrismaStatus(prisma, prismaUser, "Authorized")
                sendAuthorizedToSubscribeEmail(prismaUser)
            }
        }
    }
    return "OK"
};

function sendAuthorizedToSubscribeEmail(user: User) {
    sendTransactionalEmail(user.email, "d-a62e1c840166432abd396d1536e4489d", {
        name: user.firstName,
        url: `${process.env.SEEDLING_URL}/complete?idHash=${getUserIDHash(
            user.id
        )}`,
    })
}