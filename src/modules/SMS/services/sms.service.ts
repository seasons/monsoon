import { Customer, User } from "@app/decorators"
import { TwilioService } from "@app/modules/Twilio/services/twilio.service"
import { TwilioUtils } from "@app/modules/Twilio/services/twilio.utils.service"
import { Injectable } from "@nestjs/common"
import { Args } from "@nestjs/graphql"
import {
  SmsStatus,
  UserVerificationStatus,
  UserWhereUniqueInput,
} from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { head } from "lodash"
import { PhoneNumberInstance } from "twilio/lib/rest/lookups/v1/phoneNumber"
import { VerificationCheckInstance } from "twilio/lib/rest/verify/v2/service/verificationCheck"

const twilioStatusCallback = process.env.TWILIO_STATUS_CALLBACK
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

@Injectable()
export class SMSService {
  private sid?: string
  constructor(
    private readonly prisma: PrismaService,
    private readonly twilio: TwilioService,
    private readonly twilioUtils: TwilioUtils
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

  async startSMSVerification(
    @Args() { phoneNumber }: { phoneNumber: string },
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
        verificationStatus: this.twilioUtils.twilioToPrismaVerificationStatus(
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

    const newStatus = this.twilioUtils.twilioToPrismaVerificationStatus(
      check.status
    )
    await this.prisma.client.updateUser({
      data: {
        verificationStatus: newStatus,
      },
      where: {
        id: user.id,
      },
    })

    return this.twilioUtils.twilioToPrismaVerificationStatus(check.status)
  }

  async sendSMSMessage(
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
  ): Promise<SmsStatus> {
    // Ensure there are not too many media URLs
    if (mediaUrls?.length > 10) {
      throw new Error(
        "You can only attach up to 10 media URLs to an MMS message."
      )
    }

    const phoneNumber = (head(
      await this.prisma.binding.query.customers(
        { where: { user: to } },
        `{ detail { phoneNumber } }`
      )
    ) as { detail?: { phoneNumber?: string } })?.detail?.phoneNumber
    if (!phoneNumber) {
      throw new Error(`Could not find a phone number for the indicated user.`)
    }

    // Send SMS message
    const {
      errorMessage,
      sid,
      status,
    } = await this.twilio.client.messages.create({
      body,
      mediaUrl: mediaUrls,
      from: twilioPhoneNumber,
      statusCallback: twilioStatusCallback,
      to: phoneNumber,
    })
    if (errorMessage) {
      throw new Error(errorMessage)
    }

    // Create receipt and add it to the user
    const receipt = await this.prisma.client.createSmsReceipt({
      body,
      externalId: sid,
      mediaUrls: { set: mediaUrls },
      status: this.twilioUtils.twilioToPrismaSmsStatus(status),
    })

    await this.prisma.client.updateUser({
      data: {
        smsReceipts: { connect: [{ id: receipt.id }] },
      },
      where: to,
    })

    // Return status
    return this.twilioUtils.twilioToPrismaSmsStatus(status)
  }

  async handleSMSStatusUpdate(externalId: string, status: SmsStatus) {
    await this.prisma.client.updateManySmsReceipts({
      data: { status },
      where: { externalId },
    })
  }
}
