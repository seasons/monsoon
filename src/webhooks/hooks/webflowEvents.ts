import { BlogService } from "@app/modules/Blog"
import { WebflowService } from "@app/modules/Blog/services/webflow.service"
import {
  PushNotificationsDataProvider,
  PushNotificationsService,
  PusherService,
} from "@app/modules/PushNotifications"
import { UtilsService } from "@app/modules/Utils"
import { PrismaService } from "@prisma/prisma.service"
import moment from "moment"

export const webflowEvents = async (_, res) => {
  // Create services
  const prisma = new PrismaService()
  const pushNotifications = new PushNotificationsService(
    new PusherService(),
    new PushNotificationsDataProvider(),
    prisma
  )
  const utils = new UtilsService(prisma)
  const blog = new BlogService(new WebflowService(), utils)

  // Get the last blog post
  const { name: headline, url: uri, publishedOn } = await blog.getLastPost()

  // Have we push notified about this post yet? Was it published today?
  const receiptForThisPost = await prisma.client.pushNotificationReceipts({
    where: { body_contains: headline },
  })
  const postPublishedDate = moment(publishedOn)
  const publishedToday = utils.isSameDay(
    new Date(
      postPublishedDate.year(),
      postPublishedDate.month(),
      postPublishedDate.date()
    ),
    new Date()
  )

  // If needed, push notif the people!
  if (!receiptForThisPost && publishedToday) {
    await pushNotifications.pushNotifyInterest({
      interest: "seasons-general-interest",
      pushNotifID: "NewBlogPost",
      // TODO: get the real category name
      vars: { headline, category: "placeholder", uri },
    })
  }

  res.sendStatus(200)
}
