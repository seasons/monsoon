import { Customer, User } from "@app/decorators"
import { TwilioService } from "@app/modules/Twilio"
import { Injectable } from "@nestjs/common"
import { Args } from "@nestjs/graphql"
import { UserVerificationStatus, UserWhereUniqueInput } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { upperFirst } from "lodash"
import { head } from "lodash"
import { PhoneNumberInstance } from "twilio/lib/rest/lookups/v1/phoneNumber"
import { VerificationCheckInstance } from "twilio/lib/rest/verify/v2/service/verificationCheck"

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
      friendlyName: "Seasons",
      codeLength: 6,
    })
    this.sid = service.sid
  }

  private twilioToPrismaVerificationStatus(
    statusString: string
  ): UserVerificationStatus {
    if (!["approved", "denied", "pending"].includes(statusString)) {
      throw new Error(`Got unrecognized verification status "${statusString}".`)
    }
    return upperFirst(statusString) as UserVerificationStatus
  }

  async startSMSVerification(
    @Args()
    { phoneNumber }: { phoneNumber: string },
    @Customer() customer,
    @User() user
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

    const verification = await this.twilio.client.verify
      .services(this.sid)
      .verifications.create({ to: e164PhoneNumber, channel: "sms" })
    await this.prisma.client.updateUser({
      data: {
        verificationStatus: this.twilioToPrismaVerificationStatus(
          verification.status
        ),
        verificationMethod: "SMS",
      },
      where: {
        id: user.id,
      },
    })
    const customerDetailID = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .id()
    await this.prisma.client.updateCustomerDetail({
      data: {
        phoneNumber: e164PhoneNumber,
      },
      where: {
        id: customerDetailID,
      },
    })

    return true
  }

  async checkSMSVerification(
    @Args()
    { code }: { code: string },
    @Customer() customer,
    @User() user
  ): Promise<UserVerificationStatus> {
    if (!this.sid) {
      throw new Error("Twilio service not set up yet. Please try again.")
    }

    const phoneNumber = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .phoneNumber()
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

    const newStatus = this.twilioToPrismaVerificationStatus(check.status)
    await this.prisma.client.updateUser({
      data: {
        verificationStatus: newStatus,
      },
      where: {
        id: user.id,
      },
    })

    return this.twilioToPrismaVerificationStatus(check.status)
  }

  async sendMMSMessage(
    @Args()
    {
      body,
      mediaUrls,
      to,
    }: {
      body: string
      mediaUrls?: string[]
      to: UserWhereUniqueInput
    }
  ) {
    if (mediaUrls?.length > 10) {
      throw new Error(
        "You can only attach up to 10 media URLs to an MMS message."
      )
    }

    const customer = head(
      await this.prisma.client.customers({
        where: { user: to },
      })
    )
    if (!customer) {
      throw new Error(`Could not find a customer for the user with id ${to}`)
    }

    const phoneNumber = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .phoneNumber()
    if (!phoneNumber) {
      throw new Error(
        `Could not find a phone number for the user with id ${to}.`
      )
    }

    const message = await this.twilio.client.messages.create({
      body,
      from: "+16466877438",
      to: phoneNumber,
    })
    if (message.errorMessage) {
      throw new Error(message.errorMessage)
    }

    // analytics?
    // store sid?

    return message.status
  }
}
