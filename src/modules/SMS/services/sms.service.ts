import fs from "fs"

import { Customer, User } from "@app/decorators"
import { TwilioService } from "@app/modules/Twilio/services/twilio.service"
import { TwilioUtils } from "@app/modules/Twilio/services/twilio.utils.service"
import { TwilioEvent } from "@app/modules/Twilio/twilio.types"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { Injectable } from "@nestjs/common"
import { Args } from "@nestjs/graphql"
import {
  SmsStatus,
  UserVerificationStatus,
  UserWhereUniqueInput,
} from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { LinksAndEmails } from "@seasons/wind"
import { head } from "lodash"
import { DateTime } from "luxon"
import moment from "moment"
import mustache from "mustache"
import Twilio from "twilio"
import { PhoneNumberInstance } from "twilio/lib/rest/lookups/v1/phoneNumber"
import { VerificationCheckInstance } from "twilio/lib/rest/verify/v2/service/verificationCheck"

import { SMSID, SMSPayload } from "../sms.types"

const twilioStatusCallback = process.env.TWILIO_STATUS_CALLBACK
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

@Injectable()
export class SMSService {
  private sid?: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly twilio: TwilioService,
    private readonly twilioUtils: TwilioUtils,
    private readonly paymentUtils: PaymentUtilsService
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

  async sendSMSById({
    to,
    smsId,
    renderData,
  }: {
    to: UserWhereUniqueInput
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
      to: UserWhereUniqueInput
      smsId?: SMSID
    }
  ): Promise<SmsStatus> {
    // Ensure there are not too many media URLs
    if (mediaUrls?.length > 10) {
      throw new Error(
        "You can only attach up to 10 media URLs to an MMS message."
      )
    }

    const cust = head(
      await this.prisma.binding.query.customers(
        { where: { user: to } },
        `{ user { roles email } detail { phoneNumber } }`
      )
    ) as any

    const phoneNumber = cust?.detail?.phoneNumber
    if (!phoneNumber) {
      throw new Error(`Could not find a phone number for the indicated user.`)
    }

    const shouldSend =
      process.env.NODE_ENV === "production" ||
      cust.user.email.includes("seasons.nyc")
    if (!shouldSend) {
      return "Undelivered"
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
      smsId,
    })

    await this.prisma.client.updateUser({
      data: {
        smsReceipts: { connect: [{ id: receipt.id }] },
      },
      where: to,
    })

    // Return status
    const smsStatus = this.twilioUtils.twilioToPrismaSmsStatus(status)
    return smsStatus
  }

  async handleSMSStatusUpdate(externalId: string, status: SmsStatus) {
    await this.prisma.client.updateManySmsReceipts({
      data: { status },
      where: { externalId },
    })
  }

  async handleSMSResponse(body: TwilioEvent) {
    const twiml = new Twilio.twiml.MessagingResponse()
    const genericError = `We're sorry, but we're having technical difficulties. Please contact ${process.env.MAIN_CONTACT_EMAIL}`

    const lowercaseContent = body.Body.toLowerCase()
    const now = DateTime.local()
    switch (lowercaseContent) {
      case "1":
      case "2":
      case "3":
        const possibleCustomers = await this.prisma.binding.query.customers(
          {
            where: {
              AND: [
                {
                  user: {
                    smsReceipts_some: { smsId: "ResumeReminder" },
                  },
                },
                { detail: { phoneNumber: body.From } },
              ],
            },
          },
          `
            {
              id
              status
              membership {
                id
                pauseRequests(orderBy: createdAt_DESC) {
                  id
                  resumeDate
                }
              }
            }
          `
        )
        const customerWithMembership = head(possibleCustomers) as any

        if (!customerWithMembership) {
          twiml.message(genericError)
          break
        }

        const pauseRequest =
          customerWithMembership.membership?.pauseRequests?.[0]
        if (!pauseRequest) {
          twiml.message(genericError)
          break
        }

        if (customerWithMembership.status === "Active") {
          twiml.message(
            `Sorry, your account has already been reactivated.\n\n If this is unexpected, please contact ${process.env.MAIN_CONTACT_EMAIL} for assistance.`
          )
          break
        }

        // TODO: Is this the status people take up when they cancel?
        if (customerWithMembership.status === "Deactivated") {
          twiml.message(
            `Sorry, your account has already been cancelled.\n\n If this is unexpected, please contact ${process.env.MAIN_CONTACT_EMAIL} for assistance.`
          )
          break
        }

        // TODO: Add a check here to ensure we don't extend an already extended pause request.
        if (customerWithMembership.status === "Paused") {
          const newResumeDate = moment(pauseRequest.resumeDate as string).add(
            Number(lowercaseContent),
            "months"
          )

          await this.paymentUtils.updateResumeDate(
            newResumeDate.toISOString(),
            customerWithMembership
          )

          twiml.message(
            `Your pause has been extended by ${lowercaseContent} months! Your new resume date is ${newResumeDate.format(
              "dddd, MMMM Do"
            )}.`
          )
          break
        }
        break
      case "resume":
        // TODO: Actually resume their membership
        // If they received a resume reminder and it's not too late, resume their membership immediately.
        // If they received a resume reminder and it's too late, tell them as much
        // If they did not receive a resume reminder, do nothing.
        twiml.message(
          `Your membership has been resumed!. You're free to place your next reservation.`
        )
        break
      case "stop":
        // TODO: Unsubscribe them from SMS messages
        twiml.message(
          `Sorry to see you go! You've been unsubscribed from all Seasons SMS messages.`
        )
        break
      default:
        twiml.message(
          `Sorry, we don't recognize that response. Please try again or contact ${process.env.MAIN_CONTACT_EMAIL}`
        )
    }

    // TODO: Add a try catch around the whole thing and apply a generic error message if we hit it
    return twiml.toString()
  }

  private getSMSData(smsID: SMSID, vars: any): SMSPayload {
    let { body, mediaUrls } = JSON.parse(
      fs.readFileSync(process.cwd() + "/src/modules/SMS/data.json", "utf-8")
    )[smsID]

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
