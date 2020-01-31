import sgMail from "@sendgrid/mail"
import { getAllUsers } from "../airtable/utils"
import { prisma, User } from "../prisma"
import {
  getCustomerFromUserID,
  setCustomerPrismaStatus,
  sendTransactionalEmail,
  getUserIDHash,
} from "../utils"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// When a user's status is set to "Authorized" on Airtable, execute the necessary
// actions to enable that user to register for the service
export async function checkAndAuthorizeUsers(event, context, callback) {
  // Retrieve emails and statuses of every user on the airtable DB
  let updatedUsers = []
  let usersInAirtableButNotPrisma = []
  const allAirtableUsers = await getAllUsers()
  for (let airtableUser of allAirtableUsers) {
    if (airtableUser.fields.Status === "Authorized") {
      const prismaUser = await prisma.user({ email: airtableUser.model.email })
      if (!!prismaUser) {
        const prismaCustomer = await getCustomerFromUserID(
          prisma,
          prismaUser.id
        )
        const prismaCustomerStatus = await prisma
          .customer({ id: prismaCustomer.id })
          .status()
        if (prismaCustomerStatus !== "Authorized") {
          updatedUsers = [...updatedUsers, prismaUser.email]
          setCustomerPrismaStatus(prisma, prismaUser, "Authorized")
          sendAuthorizedToSubscribeEmail(prismaUser)
        }
      } else {
        usersInAirtableButNotPrisma = [
          ...usersInAirtableButNotPrisma,
          airtableUser.model.email,
        ]
      }
    }
  }
  const response = {
    updated: updatedUsers,
    usersInAirtableButNotPrisma: usersInAirtableButNotPrisma,
  }
  console.log(response)
  return response
}

function sendAuthorizedToSubscribeEmail(user: User) {
  sendTransactionalEmail(user.email, "d-a62e1c840166432abd396d1536e4489d", {
    name: user.firstName,
    url: `${process.env.SEEDLING_URL}/complete?idHash=${getUserIDHash(
      user.id
    )}`,
  })
}
