import { ErrorService } from "@app/modules/Error/services/error.service"
import { PushNotificationService } from "@app/modules/PushNotification"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
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
    private readonly pushNotification: PushNotificationService,
    private readonly error: ErrorService
  ) {}

  @Post()
  async handlePost(@Body() body) {
    const lastBlogPost = await this.blog.getLastPost()
    const {
      id,
      slug,
      name: headline,
      url: uri,
      publishedOn,
      category,
    } = lastBlogPost

    // Have we push notified about this post yet? Was it published today?
    const possibleReceiptsForThisPost = await this.prisma.client.pushNotificationReceipts(
      {
        where: {
          OR: [
            { body_contains: headline },
            { recordID: id },
            { recordSlug: slug },
          ],
        },
      }
    )
    const receiptForThisPost = !!head(possibleReceiptsForThisPost)
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
    this.error.setExtraContext({ body }, "payload")
    this.error.setExtraContext({ data: lastBlogPost }, "lastBlogPost")
    this.error.setExtraContext(possibleReceiptsForThisPost, "receipts")
    this.error.setExtraContext(
      {
        values: {
          receiptForThisPost,
          publishedToday,
          sendPushNotif,
        },
      },
      "runtimeVariables"
    )
    this.error.captureMessage(`Received webflow event`)
    if (sendPushNotif) {
      receipt = await this.pushNotification.pushNotifyInterest({
        interest: "seasons-general-notifications",
        pushNotifID: "NewBlogPost",
        debug: true,
        vars: {
          headline,
          category: upperFirst(category.toLowerCase()),
          uri,
          id,
          slug,
        },
      })
    }

    return {
      pushNotifSent: sendPushNotif,
      receipt: omit(receipt, ["updatedAt", "createdAt"]),
    }
  }
}
