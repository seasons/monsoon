import { WebClient } from "@slack/web-api"

export class SlackService {
  async postMessage(message) {
    await new WebClient(process.env.SLACK_CANARY_API_TOKEN).chat.postMessage(
      message
    )
  }
}
