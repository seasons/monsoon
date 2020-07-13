import { PushNotificationService } from "@app/modules/PushNotification"
import { UtilsService } from "@app/modules/Utils"
import { PrismaService } from "@app/prisma/prisma.service"
import { Body, Controller, Logger, Post } from "@nestjs/common"
import { head, omit, upperFirst } from "lodash"
import moment from "moment"

import { BlogService } from "../services/blog.service"

/**
 *
 * @Example POST http://localhost:4000/webflow_events
 */
@Controller("webflow_events")
export class WebflowController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blog: BlogService,
    private readonly utils: UtilsService,
    private readonly pushNotification: PushNotificationService
  ) {}

  @Post()
  async handlePost() {
    const {
      id,
      slug,
      name: headline,
      url: uri,
      publishedOn,
      category,
    } = await this.blog.getLastPost()

    // Have we push notified about this post yet? Was it published today?
    const receiptForThisPost = !!head(
      await this.prisma.client.pushNotificationReceipts({
        where: {
          OR: [
            { body_contains: headline },
            { recordID: id },
            { recordSlug: slug },
          ],
        },
      })
    )
    const postPublishedDate = moment(publishedOn)
    const publishedToday = this.utils.isSameDay(
      new Date(
        postPublishedDate.year(),
        postPublishedDate.month(),
        postPublishedDate.date()
      ),
      new Date()
    )

    // If needed, push notif the people!
    let receipt
    const sendPushNotif = !receiptForThisPost && publishedToday
    if (sendPushNotif) {
      receipt = await this.pushNotification.pushNotifyInterest({
        interest: "seasons-general-notifications",
        pushNotifID: "NewBlogPost",
        vars: {
          headline,
          category: upperFirst(category.toLowerCase()),
          uri,
          id,
          slug,
        },
        debug: true,
      })
    }

    return {
      pushNotifSent: sendPushNotif,
      receipt: omit(receipt, ["updatedAt", "createdAt"]),
    }
  }
}
