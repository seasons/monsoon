import sgMail from "@sendgrid/mail"

import { getAllUsers, getAllReservations } from "./airtable/utils"
import { prisma, User } from "./prisma"
import {
  getCustomerFromUserID,
  setCustomerPrismaStatus,
  sendTransactionalEmail,
  getUserIDHash,
} from "./utils"

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

export async function completeReservations(event, context, callback) {
  const updated = []
  const reservationsInAirtableButNotPrisma = []
  const allAirtableReservations = await getAllReservations()
  for (let airtableReservation of allAirtableReservations) {
    if (airtableReservation.fields.Status === "Completed") {
      // TODO: update how we grab the reservation
      const prismaReservation = await prisma.reservation({ id: "asdf09asdf" })

      if (!!prismaReservation) {
        if (prismaReservation.status !== "Completed") {
          updated.push(prismaReservation.reservationNumber)
          const prismaUser = await prisma.user({
            email: airtableReservation.fields["User Email"],
          })

          // Update the status
          prisma.updateReservation({
            data: { status: "Completed" },
            where: { id: prismaReservation.id },
          })

          // Email the user
          sendYouCanNowReserveAgainEmail(prismaUser)

          // Update the returnPackage on the shipment
          // Check each item on the airtable reservation record. If it's reservable,
          // add it the products on the returnPackage. Then calculate the full
          // weight of the package and add that to the returnPackage as well.
        }
      } else {
        reservationsInAirtableButNotPrisma.push(airtableReservation.fields.ID)
      }
    }
  }

  return {
    updated,
    reservationsInAirtableButNotPrisma,
  }
}

function sendAuthorizedToSubscribeEmail(user: User) {
  sendTransactionalEmail(user.email, "d-a62e1c840166432abd396d1536e4489d", {
    name: user.firstName,
    url: `${process.env.SEEDLING_URL}/complete?idHash=${getUserIDHash(
      user.id
    )}`,
  })
}

function sendYouCanNowReserveAgainEmail(user: User) {
  sendTransactionalEmail(user.email, "TK", {
    name: user.firstName,
  })
}
