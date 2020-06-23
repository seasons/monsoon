import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  try {
    const users = await ps.client.users()
    const interests = await ps.client.userPushNotificationInterests()
    users?.forEach(async user => {
      const receipts = await ps.client.pushNotificationReceipts({
        where: {
          users_some: { id: user.id },
        },
      })
      const pushNotif = await ps.client.createUserPushNotification({
        status: true,
        interests: { connect: interests },
        history: { connect: receipts },
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
