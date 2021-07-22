import { Customer, User } from "@app/decorators"
import { EmailService } from "@app/modules/Email/services/email.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { TwilioService } from "@app/modules/Twilio/services/twilio.service"
import { TwilioUtils } from "@app/modules/Twilio/services/twilio.utils.service"
import { TwilioEvent } from "@app/modules/Twilio/twilio.types"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import { Args } from "@nestjs/graphql"
import { Prisma } from "@prisma/client"
import {
  CustomerStatus,
  SmsStatus,
  UserVerificationStatus,
} from "@prisma1/index"
import { PrismaService } from "@prisma1/prisma.service"
import { LinksAndEmails } from "@seasons/wind"
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly twilio: TwilioService,
    private readonly twilioUtils: TwilioUtils,
    private readonly paymentUtils: PaymentUtilsService,
    private readonly error: ErrorService,
    private readonly email: EmailService,
    private readonly utils: UtilsService,
    private readonly queryUtils: QueryUtilsService
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

    await this.prisma.client2.user.update({
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

    const customerDetail = await this.prisma.client2.customerDetail.findFirst({
      where: {
        customer: {
          id: customer.id,
        },
      },
    })

    await this.prisma.client2.customerDetail.update({
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
    const detail = await this.prisma.client2.customerDetail.findFirst({
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

    await this.prisma.client2.user.update({
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

    const _cust = await this.prisma.client2.customer.findFirst({
      where: { user: to },
      select: {
        detail: { select: { phoneNumber: true } },
        user: { select: { roles: true, email: true, sendSystemEmails: true } },
      },
    })
    const cust = this.prisma.sanitizePayload(_cust, "Customer")

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
      await this.prisma.client2.user.update({
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
    await this.prisma.client2.smsReceipt.updateMany({
      data: { status },
      where: { externalId },
    })
  }

  async handleSMSResponse(body: TwilioEvent) {
    const twiml = new Twilio.twiml.MessagingResponse()
    const genericError = `We're sorry, but we're having technical difficulties. Please contact ${process.env.MAIN_CONTACT_EMAIL}`

    let sendCorrespondingEmailFunc
    try {
      let smsCust
      let status
      const lowercaseContent = body.Body.toLowerCase().replace(/"/g, "")
      switch (lowercaseContent) {
        case "1":
        case "2":
        case "3":
          smsCust = await this.getSMSUser(body.From, "ResumeReminder", {
            id: true,
            status: true,
            user: { select: { firstName: true, email: true, id: true } },
            membership: {
              select: {
                id: true,
                subscriptionId: true,
                pauseRequests: {
                  select: { id: true, resumeDate: true },
                  orderBy: {
                    createdAt: "desc",
                  },
                },
              },
            },
          })
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
                sendCorrespondingEmailFunc = async () => {
                  const _custWithUpdatedResumeDate = await this.prisma.client2.customer.findUnique(
                    {
                      where: { id: smsCust.id },
                      select: {
                        id: true,
                        user: {
                          select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                          },
                        },
                        membership: {
                          select: {
                            id: true,
                            plan: {
                              select: {
                                id: true,
                                tier: true,
                                planID: true,
                                itemCount: true,
                              },
                            },
                            pauseRequests: {
                              select: {
                                id: true,
                                createdAt: true,
                                resumeDate: true,
                                pauseDate: true,
                                pauseType: true,
                              },
                            },
                          },
                        },
                        reservations: {
                          select: { id: true, status: true, createdAt: true },
                        },
                      },
                    }
                  )
                  const custWithUpdatedResumeDate = this.prisma.sanitizePayload(
                    _custWithUpdatedResumeDate,
                    "Customer"
                  )
                  return await this.email.sendPausedEmail(
                    custWithUpdatedResumeDate,
                    true
                  )
                }
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
          smsCust = await this.getSMSUser(body.From, "ResumeReminder", {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            membership: { select: { id: true, subscriptionId: true } },
          })

          if (!smsCust) {
            twiml.message(genericError)
            break
          }

          status = smsCust.status as CustomerStatus
          switch (status) {
            case "Paused":
              await this.paymentUtils.resumeSubscription(
                smsCust.membership.subscriptionId,
                null,
                smsCust
              )
              sendCorrespondingEmailFunc = async () =>
                await this.email.sendResumeConfirmationEmail(smsCust.user)
              twiml.message(
                `Your membership has been resumed!. You're free to place your next reservation.`
              )
              break
            default:
              twiml.message(genericError)
          }
          break
        case "stop":
        case "stopall":
        case "unsubscribe":
        case "cancel":
        case "end":
        case "quit":
        case "start":
        case "yes":
        case "unstop":
        case "help":
        case "info":
          // Twilio handles these reserved keywords. Do nothing.
          // https://support.twilio.com/hc/en-us/articles/223134027-Twilio-support-for-opt-out-keywords-SMS-STOP-filtering-
          break
        default:
          twiml.message(
            `Sorry, we don't recognize that response. Please try again or contact ${process.env.MAIN_CONTACT_EMAIL}`
          )
      }
    } catch (err) {
      this.error.setExtraContext(body, "twilioEvent")
      this.error.captureError(err)
      twiml.message(genericError)
    }

    await sendCorrespondingEmailFunc?.()
    return twiml.toString()
  }

  private formatResumeDate = date => date.format("dddd, MMMM Do")

  private async getSMSUser(
    from: string,
    smsId: SMSID,
    select: Prisma.CustomerSelect
  ) {
    const customer = await this.prisma.client2.customer.findFirst({
      where: {
        AND: [
          {
            user: {
              smsReceipts: { some: { smsId } },
            },
          },
          { detail: { phoneNumber: { contains: from.slice(2) } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      select,
    })

    return this.prisma.sanitizePayload(customer, "Customer")
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
