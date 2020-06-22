import { TwilioService } from "@app/modules/Twilio"
import { AuthService } from "@modules/User/services/auth.service"
import { Injectable } from "@nestjs/common"
import { Args } from "@nestjs/graphql"
import {
  CustomerDetail,
  UserVerificationStatus,
  UserWhereUniqueInput,
} from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { PhoneNumberInstance } from "twilio/lib/rest/lookups/v1/phoneNumber"
import { VerificationCheckInstance } from "twilio/lib/rest/verify/v2/service/verificationCheck"

@Injectable()
export class SMSService {
  private sid?: string
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly twilio: TwilioService
  ) {
    this.setupService()
  }

  private async setupService() {
    const service = await this.twilio.client.verify.services.create({
      friendlyName: "Seasons",
      codeLength: 6,
    })
    this.sid = service.sid
  }

  private twilioToPrismaStatus(statusString: string): UserVerificationStatus {
    switch (statusString.toLowerCase()) {
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

  private async getCustomerDetail(userID: string): Promise<CustomerDetail> {
    const customer = await this.authService.getCustomerFromUserID(userID)
    const detail = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
    return detail
  }

  async startSMSVerification(
    @Args()
    { phoneNumber, where }: { phoneNumber: string; where: UserWhereUniqueInput }
  ): Promise<boolean> {
    if (!this.sid) {
      throw new Error("Twilio service not set up yet. Please try again.")
    }

    let validPhoneNumber: PhoneNumberInstance
    try {
      validPhoneNumber = await this.twilio.client.lookups
        .phoneNumbers(phoneNumber)
        .fetch()
    } catch (error) {
      throw new Error("Invalid phone number.")
    }
    const e164PhoneNumber = validPhoneNumber.phoneNumber
    const user = await this.prisma.binding.query.user({ where })
    const customerDetail = await this.getCustomerDetail(user.id)

    const verification = await this.twilio.client.verify
      .services(this.sid)
      .verifications.create({ to: e164PhoneNumber, channel: "sms" })
    await this.prisma.binding.mutation.updateUser({
      data: {
        verificationStatus: this.twilioToPrismaStatus(verification.status),
        verificationMethod: "SMS",
      },
      where: {
        id: user.id,
      },
    })
    await this.prisma.binding.mutation.updateCustomerDetail({
      data: {
        phoneNumber: e164PhoneNumber,
      },
      where: {
        id: customerDetail.id,
      },
    })

    return true
  }

  async checkSMSVerification(
    @Args()
    { code, where }: { code: string; where: UserWhereUniqueInput }
  ): Promise<UserVerificationStatus> {
    if (!this.sid) {
      throw new Error("Twilio service not set up yet. Please try again.")
    }

    const user = await this.prisma.binding.query.user({ where })
    const customerDetail = await this.getCustomerDetail(user.id)

    const phoneNumber = customerDetail.phoneNumber
    if (!phoneNumber) {
      throw new Error("Cannot find a phone number for this user.")
    }

    let check: VerificationCheckInstance
    try {
      check = await this.twilio.client.verify
        .services(this.sid)
        .verificationChecks.create({ to: phoneNumber, code })
    } catch (error) {
      if (error.code === 20404) {
        // Most likely, Twilio has deleted the verification SID because it has expired, been approved, or the
        // max attempts to check a code has been reached. Return the current verification status instead.
        return user.verificationStatus
      } else {
        throw error
      }
    }

    const newStatus = this.twilioToPrismaStatus(check.status)
    await this.prisma.binding.mutation.updateUser({
      data: {
        verificationStatus: newStatus,
      },
      where: {
        id: user.id,
      },
    })

    return this.twilioToPrismaStatus(check.status)
  }
}
