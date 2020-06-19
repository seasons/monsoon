import { User } from "@app/decorators"
import { TwilioService } from "@app/modules/Twilio"
import { Injectable } from "@nestjs/common"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { UserVerificationStatus, UserWhereUniqueInput } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { Twilio } from "twilio"

// https://www.twilio.com/docs/verify/api/verification-check

@Injectable()
export class SMSService {
  private sid?: string
  constructor(
    private readonly prisma: PrismaService,
    private readonly twilio: TwilioService
  ) {
    this.setupService()
  }

  private async setupService() {
    const service = await this.twilio.client.verify.services.create({
      friendlyName: "SMS Verification Service",
      codeLength: 6,
    })
    this.sid = service.sid
  }

  private status(statusString: string): UserVerificationStatus {
    switch (statusString) {
      case "approved":
        return "Approved"
      case "denied":
        return "Denied"
      case "pending":
        return "Pending"
      default:
        throw new Error(
          `Got unrecognized verification status "${statusString}".`
        )
    }
  }

  async startSMSVerification(
    @Args()
    { phoneNumber, where }: { phoneNumber: string; where: UserWhereUniqueInput }
  ): Promise<boolean> {
    // verify if number is valid? https://www.twilio.com/docs/lookup/tutorials/validation-and-formatting
    // store number in user
    if (!this.sid) {
      throw new Error("Twilio service not set up yet. Please try again.")
    }

    const verification = await this.twilio.client.verify
      .services(this.sid)
      .verifications.create({ to: phoneNumber, channel: "sms" })
    // store status in user
    await this.prisma.binding.mutation.updateUser({
      data: {
        verificationStatus: this.status(verification.status),
        verificationMethod: "SMS",
      },
      where: {
        id: where.id,
      },
    })
    return true
  }

  async checkSMSVerification(args): Promise<UserVerificationStatus> {
    const { code, where } = args

    const phoneNumber = "" // get number from param or db?
    const check = await this.twilio.client.verify
      .services(this.sid)
      .verificationChecks.create({ to: phoneNumber, code })
    // update status
    return this.status(check.status)
  }
}
