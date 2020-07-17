import { Customer, User } from "@app/decorators"
import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { SMSService } from "../services/sms.service"

@Resolver()
export class SMSMutationsResolver {
  constructor(private readonly smsService: SMSService) {}

  @Mutation()
  async startSMSVerification(@Args() args, @Customer() customer, @User() user) {
    const success = await this.smsService.startSMSVerification(
      args,
      customer,
      user
    )
    // analytics?
    return success
  }

  @Mutation()
  async checkSMSVerification(@Args() args, @Customer() customer, @User() user) {
    const status = await this.smsService.checkSMSVerification(
      args,
      customer,
      user
    )
    // analytics?
    return status
  }

  @Mutation()
  async sendSMSMessage(@Args() args) {
    return this.smsService.sendSMSMessage(args)
  }
}
