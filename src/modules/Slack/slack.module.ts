import { Module } from "@nestjs/common"

import { SlackService } from "./services/slack.service"

@Module({
  providers: [SlackService],
  exports: [SlackService],
})
export class SlackModule {}
