import { SlackService } from "@modules/Slack/services/slack.service"
import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

@Injectable()
export class AnalyticsScheduledJobs {
  constructor(private readonly slackService: SlackService) {}

  //   @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_9AM)
  @Cron(CronExpression.EVERY_10_SECONDS)
  async reportGrowthFunnels() {
    console.log(`run growth funnels job)`)
    let message = {
      channel: process.env.SLACK_FUNNEL_CHANNEL_ID,
      text: "",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:newspaper: *Growth Funnels Report* :newspaper:`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `*${new Date().toLocaleDateString()}*`,
            },
          ],
        },
      ],
    }
    await this.slackService.postMessage(message)
    await this.slackService.postMessage({
      channel: process.env.SLACK_FUNNEL_CHANNEL_ID,
      text:
        "https://mixpanel.com/report/2195096/view/361951/funnels#view/10027323/created-account-activated",
    })
  }
}
