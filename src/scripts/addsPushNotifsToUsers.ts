import { UserPushNotificationInterestType } from "../prisma"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  try {
    const users = await ps.client.users()
    const interests = ["General", "Blog", "Bag", "NewProduct"]
    users?.forEach(async user => {
      const interestsIDs = []
      interests.forEach(async interest => {
        const createdInterest = await ps.client.createUserPushNotificationInterest(
          {
            type: interest as UserPushNotificationInterestType,
            value: "",
            user: { connect: { id: user.id } },
            status: true,
          }
        )
        interestsIDs.push({ id: createdInterest.id })
      })
      const receipts = await ps.client.pushNotificationReceipts({
        where: {
          users_some: { id: user.id },
        },
      })

      const pushNotif = await ps.client.createUserPushNotification({
        status: true,
        interests: { connect: interestsIDs },
        history: {
          connect: receipts.map(receipt => {
            return { id: receipt.id }
          }),
        },
      })

      await ps.client.updateUser({
        where: { id: user.id },
        data: { pushNotification: { connect: { id: pushNotif.id } } },
      })
    })
  } catch (err) {
    console.log(err)
  }
}

run()
