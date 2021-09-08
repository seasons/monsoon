import { Customer, User } from "@app/decorators"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { TwilioService } from "@app/modules/Twilio/services/twilio.service"
import { TwilioUtils } from "@app/modules/Twilio/services/twilio.utils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import { Args } from "@nestjs/graphql"
import { Prisma, SmsStatus, UserVerificationStatus } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { LinksAndEmails } from "@seasons/wind"
import mustache from "mustache"
import { PhoneNumberInstance } from "twilio/lib/rest/lookups/v1/phoneNumber"
import { VerificationCheckInstance } from "twilio/lib/rest/verify/v2/service/verificationCheck"

import { SMSID, SMSPayload } from "../sms.types.d"

const twilioStatusCallback = process.env.TWILIO_STATUS_CALLBACK
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
@Injectable()
export class SMSService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly twilio: TwilioService,
    private readonly twilioUtils: TwilioUtils,
    private readonly error: ErrorService,
    private readonly utils: UtilsService
  ) {}

  async startSMSVerification(
    @Args() { phoneNumber }: { phoneNumber: string },
    @Customer() customer,
    @User() user
  ): Promise<boolean> {
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
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({ to: e164PhoneNumber, channel: "sms" })

    await this.prisma.client.user.update({
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

    const customerDetail = await this.prisma.client.customerDetail.findFirst({
      where: {
        customer: {
          id: customer.id,
        },
      },
    })

    await this.prisma.client.customerDetail.update({
      where: { id: customerDetail.id },
      data: {
        phoneNumber: e164PhoneNumber,
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
    const detail = await this.prisma.client.customerDetail.findFirst({
      where: {
        customer: {
          id: customer.id,
        },
      },
    })
    const phoneNumber = detail.phoneNumber

    if (!phoneNumber) {
      throw new Error("Cannot find a phone number for this user.")
    }

    let check: VerificationCheckInstance
    try {
      check = await this.twilio.client.verify
        .services(process.env.TWILIO_SERVICE_SID)
        .verificationChecks.create({
          to: phoneNumber,
          code,
        })
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

    await this.prisma.client.user.update({
      data: {
        verificationStatus: newStatus,
      },
      where: {
        id: user.id,
      },
    })

    return this.twilioUtils.twilioToPrismaVerificationStatus(check.status)
  }

  async sendSMSById({
    to,
    smsId,
    renderData,
  }: {
    to: Prisma.UserWhereUniqueInput
    smsId: SMSID
    renderData: any
  }) {
    const { body, mediaUrls } = this.getSMSData(smsId, renderData)
    return await this.sendSMSMessage({
      to,
      body,
      mediaUrls,
      smsId,
    })
  }

  async sendSMSMessage(
    @Args()
    {
      body,
      mediaUrls,
      to,
      smsId,
    }: {
      body: string
      mediaUrls?: string[]
      to: Prisma.UserWhereUniqueInput
      smsId?: SMSID
    }
  ): Promise<SmsStatus> {
    // Ensure there are not too many media URLs
    if (mediaUrls?.length > 10) {
      throw new Error(
        "You can only attach up to 10 media URLs to an MMS message."
      )
    }

    const cust = await this.prisma.client.customer.findFirst({
      where: { user: to },
      select: {
        detail: { select: { phoneNumber: true } },
        user: { select: { roles: true, email: true, sendSystemEmails: true } },
      },
    })

    const phoneNumber = cust?.detail?.phoneNumber
    if (!phoneNumber) {
      throw new Error(`Could not find a phone number for the indicated user.`)
    }

    // If we decide in the future to send non-marketing, more critical text messsages,
    // update this to not block on sendSystemEmails
    const shouldSend =
      cust.user.sendSystemEmails &&
      (process.env.NODE_ENV === "production" ||
        cust.user.email.includes("seasons.nyc"))
    if (!shouldSend) {
      return "Undelivered"
    }

    // Send SMS message
    try {
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
        this.error.setExtraContext({ cust }, "customer")
        this.error.captureError(new Error(errorMessage))
      }
      // Create receipt and add it to the user
      await this.prisma.client.user.update({
        where: to,
        data: {
          smsReceipts: {
            create: {
              body,
              externalId: sid,
              mediaUrls,
              status: this.twilioUtils.twilioToPrismaSmsStatus(status),
              smsId,
            },
          },
        },
      })
      // Return status
      const smsStatus = this.twilioUtils.twilioToPrismaSmsStatus(status)
      return smsStatus
    } catch (err) {
      this.error.setExtraContext({ cust }, "customer")
      this.error.captureError(err)
      return "Failed"
    }
  }

  async handleSMSStatusUpdate(externalId: string, status: SmsStatus) {
    await this.prisma.client.smsReceipt.updateMany({
      data: { status },
      where: { externalId },
    })
  }

  private getSMSData(smsID: SMSID, vars: any): SMSPayload {
    let { body, mediaUrls } = this.utils.parseJSONFile("src/modules/SMS/data")[
      smsID
    ]

    body = this.interpolateJSONObjectWithMustache(body, {
      ...vars,
      ...LinksAndEmails,
    })
    mediaUrls = this.interpolateJSONObjectWithMustache(mediaUrls, {
      ...vars,
      ...LinksAndEmails,
    })

    return {
      body,
      mediaUrls,
    }
  }

  private interpolateJSONObjectWithMustache(obj: any, vars: any = {}) {
    return JSON.parse(mustache.render(JSON.stringify(obj), vars))
  }
}
