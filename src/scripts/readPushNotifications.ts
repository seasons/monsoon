import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const pushNotifications = await ps.binding.query.pushNotificationReceipts(
    {
      where: {
        sentAt_gte: "2020-06-03T17:30:52.986Z",
        title_contains: "Now available: Our Legacy Spring/Summer 21",
      },
    },
    `{
        id
        users {
          email
        }
        body
        title
        recordID
        recordSlug
        notificationKey
        sentAt
      }`
  )

  let usersToCount = {}
  let moreThanOne = new Set()
  for (let pushNotif of pushNotifications) {
    const email = pushNotif?.users?.[0].email

    if (email) {
      const count = email in usersToCount ? usersToCount[email] + 1 : 1
      usersToCount[email] = count

      if (email in usersToCount) {
        moreThanOne.add(email)
      }
    }
  }

  console.log(JSON.stringify(usersToCount, null, 2))
  console.log(moreThanOne)
}

run()
