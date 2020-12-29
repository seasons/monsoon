import fs from "fs"

import { Customer, User } from "@app/decorators"
import { TwilioService } from "@app/modules/Twilio/services/twilio.service"
import { TwilioUtils } from "@app/modules/Twilio/services/twilio.utils.service"
import { TwilioEvent } from "@app/modules/Twilio/twilio.types"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { Injectable } from "@nestjs/common"
import { Args } from "@nestjs/graphql"
import {
  CustomerStatus,
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

    let smsCust
    let status
    const lowercaseContent = body.Body.toLowerCase().replace(/"/g, "")
    switch (lowercaseContent) {
      case "1":
      case "2":
      case "3":
        smsCust = await this.getSMSUser(
          body.From,
          "ResumeReminder",
          `{
            id
            status
            membership {
              id
              subscriptionId
              pauseRequests(orderBy: createdAt_DESC) {
                id
                resumeDate
              }
            }
          }
        `
        )

        if (!smsCust) {
          twiml.message(genericError)
          break
        }

        status = smsCust.status as CustomerStatus
        switch (status) {
          case "Active":
            twiml.message(
              `Your account is already active.\n\nIf this is unexpected, please contact ${process.env.MAIN_CONTACT_EMAIL} for assistance.`
            )
            break
          case "Deactivated":
            twiml.message(
              `Your account is currently deactivated.\n\nTo reactivate, please contact ${process.env.MAIN_CONTACT_EMAIL}.`
            )
            break
          case "Paused":
            const pauseRequest = smsCust.membership?.pauseRequests?.[0]
            if (!pauseRequest) {
              twiml.message(genericError)
              break
            }

            const resumeDateMoment = moment(pauseRequest.resumeDate as string)
            const now = moment()
            if (resumeDateMoment.diff(now, "days") < 30) {
              const numMonthsToExtend = Number(lowercaseContent)
              const newResumeDate = moment(
                pauseRequest.resumeDate as string
              ).add(numMonthsToExtend, "months")

              await this.paymentUtils.updateResumeDate(
                newResumeDate.toISOString(),
                smsCust
              )

              twiml.message(
                `Your pause has been extended by ${lowercaseContent} month${
                  numMonthsToExtend === 1 ? "" : "s"
                }! Your new resume date is ${this.formatResumeDate(
                  newResumeDate
                )}.`
              )
            } else {
              twiml.message(
                `You are scheduled to resume on ${this.formatResumeDate(
                  resumeDateMoment
                )}. We'll reach out then to ask if you'd like to resume or extend your pause.`
              )
            }
            break
          default:
            twiml.message(genericError)
        }
        break
      case "resume":
        smsCust = await this.getSMSUser(
          body.From,
          "ResumeReminder",
          `{
            id
            membership {
              id
              subscriptionId
            }
          }
        `
        )

        if (!smsCust) {
          twiml.message(genericError)
          break
        }

        status = smsCust.status as CustomerStatus
        switch (status) {
          case "Paused":
            await this.paymentUtils.resumeSubscription(null, null, smsCust)
            twiml.message(
              `Your membership has been resumed!. You're free to place your next reservation.`
            )
            break
          default:
            twiml.message(genericError)
        }
        break
      default:
        twiml.message(
          `Sorry, we don't recognize that response. Please try again or contact ${process.env.MAIN_CONTACT_EMAIL}`
        )
    }

    // TODO: Add a try catch around the whole thing and apply a generic error message if we hit it
    return twiml.toString()
  }

  private formatResumeDate = date => date.format("dddd, MMMM Do")

  private async getSMSUser(from: string, smsId: SMSID, info: string) {
    const possibleCustomers = await this.prisma.binding.query.customers(
      {
        where: {
          AND: [
            {
              user: {
                smsReceipts_some: { smsId },
              },
            },
            { detail: { phoneNumber: from } },
          ],
        },
      },
      info
    )
    const cust = head(possibleCustomers) as any

    return cust
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
