import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { SMSService } from "../services/sms.service"

@Resolver()
export class SMSMutationsResolver {
  constructor(private readonly smsService: SMSService) {}

  @Mutation()
  async startSMSVerification(@Args() args) {
    const success = await this.smsService.startSMSVerification(args)
    // analytics?
    return success
  }

  @Mutation()
  async checkSMSVerification(@Args() args) {
    const status = await this.smsService.checkSMSVerification(args)
    // analytics?
    return status
  }
}
