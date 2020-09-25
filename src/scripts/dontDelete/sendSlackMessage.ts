import "module-alias/register"

import { WebClient } from "@slack/web-api"

/*
 *  Use: This script can be used to make a reservation feedback object on a specific user for testing purposes
 *  Reason not to delete: This is helpful for testing the reservation feedback flow
 */
const run = async () => {
  const chat = new WebClient(process.env.SLACK_CANARY_API_TOKEN).chat
  await chat.postMessage({
    username: "Faiyam Rahman",
    channel: process.env.SLACK_FUNNEL_CHANNEL_ID,
    text:
      "https://mixpanel.com/report/2195096/view/361951/insights#report/10028028",
  })
}

run()
