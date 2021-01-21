import { Customer, User } from "@app/decorators"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { SMSService } from "../services/sms.service"

@Resolver()
export class SMSMutationsResolver {
  constructor(
    private readonly smsService: SMSService,
    private readonly error: ErrorService
  ) {}

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
    this.error.setExtraContext({ data: customer }, "customer")
    this.error.setExtraContext({ data: user }, "user")
    this.error.setExtraContext({ data: args }, "args")
    this.error.setExtraContext({ value: status }, "status")
    this.error.captureMessage(`Checked SMS Verification `)
    return status
  }

  @Mutation()
  async sendSMSMessage(@Args() args) {
    return this.smsService.sendSMSMessage(args)
  }
}
