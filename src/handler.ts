import sgMail from "@sendgrid/mail"

import { getAllUsers } from "./airtable/utils"
import { prisma } from "./prisma"
import { getCustomerFromUserID, setCustomerPrismaStatus, sendTransactionalEmail, getUserIDHash } from "./utils"
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

module.exports.checkAndAuthorizeUsers = async (event, context, callback) => {
    const x = await prisma.user({ email: "frahman305@gmail.com" }).id()
    console.log(x)
    // // Retrieve emails and statuses of every user on the airtable DB
    // const allAirtableUsers = await getAllUsers()
    // for (let airtableUser of allAirtableUsers) {
    //     if (airtableUser.fields.Status === "Authorized") {
    //         console.log(airtableUser.model)
    //         const prismaUserId = await prisma.user({ email: "frahman305@gmail.com" }).id()
    //         console.log(prismaUserId)
    //         let customerArray = await prisma.customers({
    //             where: { user: { id: prismaUserId } },
    //         }).then(resp => console.log(resp))
    //         const prismaCustomer = await getCustomerFromUserID(prisma, prismaUserId)
    //         const prismaCustomerStatus = await prisma.customer({ user: { email: airtableUser.model.email } })
    //         if (prismaCustomerStatus !== "Authorized") {
    //             // setCustomerPrismaStatus(prisma, prismaUser, "Authorized")
    //             sendAuthorizedToSubscribeEmail(airtableUser.model.email, airtableUser.model.firstName, prismaUserId)
    //         }
    //     }
    // }
    // return "OK"
};

function sendAuthorizedToSubscribeEmail(email: string, firstName: string, id: string) {
    sendTransactionalEmail(email, "d-a62e1c840166432abd396d1536e4489d", {
        name: firstName,
        url: `${process.env.SEEDLING_URL}/complete?idHash=${getUserIDHash(
            id
        )}`,
    })
}