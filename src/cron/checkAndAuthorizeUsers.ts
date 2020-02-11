import sgMail from "@sendgrid/mail"
import { getAllUsers } from "../airtable/utils"
import { prisma, User } from "../prisma"
import {
  getCustomerFromUserID,
  setCustomerPrismaStatus,
  sendTransactionalEmail,
  getUserIDHash,
} from "../utils"
import * as Sentry from "@sentry/node"
import { emails } from "../emails"

const shouldReportErrorsToSentry = process.env.NODE_ENV === "production"
if (shouldReportErrorsToSentry) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  })
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// When a user's status is set to "Authorized" on Airtable, execute the necessary
// actions to enable that user to register for the service
export async function checkAndAuthorizeUsers(event, context, callback) {
  let response
  try {
    // Retrieve emails and statuses of every user on the airtable DB
    let updatedUsers = []
    let usersInAirtableButNotPrisma = []
    const allAirtableUsers = await getAllUsers()
    for (const airtableUser of allAirtableUsers) {
      if (airtableUser.fields.Status === "Authorized") {
        const prismaUser = await prisma.user({
          email: airtableUser.model.email,
        })
        if (!!prismaUser) {
          // Add user context on Sentry
          if (shouldReportErrorsToSentry) {
            Sentry.configureScope(scope => {
              scope.setUser({ id: prismaUser.id, email: prismaUser.email })
            })
          }

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
    response = {
      updated: updatedUsers,
      usersInAirtableButNotPrisma,
    }
  } catch (err) {
    if (shouldReportErrorsToSentry) {
      Sentry.captureException(err)
    }
  }

  return response
}

function sendAuthorizedToSubscribeEmail(user: User) {
  sendTransactionalEmail(
    user.email,
    process.env.MASTER_EMAIL_TEMPLATE_ID,
    emails.completeAccountData(
      user.firstName,
      `${process.env.SEEDLING_URL}/complete?idHash=${getUserIDHash(user.id)}`
    )
  )
}
