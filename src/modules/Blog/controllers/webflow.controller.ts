import { PushNotificationService } from "@app/modules/PushNotification"
import { UtilsService } from "@app/modules/Utils"
import { PrismaService } from "@app/prisma/prisma.service"
import { Body, Controller, Logger, Post } from "@nestjs/common"
import { upperFirst } from "lodash"
import moment from "moment"

import { BlogService } from "../services/blog.service"

/**
 *
 * @Example POST http://localhost:4000/webflow_events
 */
@Controller("webflow_events")
export class WebflowController {
  private readonly logger = new Logger(WebflowController.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly blog: BlogService,
    private readonly utils: UtilsService,
    private readonly pushNotification: PushNotificationService
  ) {}

  @Post()
  async handlePost(@Body() body: any) {
    // Get the last blog post
    const {
      name: headline,
      url: uri,
      publishedOn,
      category,
    } = await this.blog.getLastPost()

    // Have we push notified about this post yet? Was it published today?
    const receiptForThisPost =
      (
        await this.prisma.client.pushNotificationReceipts({
          where: { body_contains: headline },
        })
      )?.length === 1
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
    const sendPushNotif = !receiptForThisPost && publishedToday
    if (sendPushNotif) {
      await this.pushNotification.pushNotifyInterest({
        interest: "seasons-general-notifications",
        pushNotifID: "NewBlogPost",
        vars: { headline, category: upperFirst(category.toLowerCase()), uri },
        debug: true,
      })
    }

    return {
      pushNotifSent: sendPushNotif,
    }
  }
}
