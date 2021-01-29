import * as util from "util"

import { ApplicationType } from "@app/decorators/application.decorator"
import { CustomerStatus, PaymentPlanTier } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import * as Sentry from "@sentry/node"
import Analytics from "analytics-node"
import { NumberPage } from "twilio/lib/rest/pricing/v1/voice/number"

type SubscribedProperties = CommonTrackProperties & {
  tier: PaymentPlanTier
  planID: string
  method: "ApplePay" | "ChargebeeHostedCheckout"
}

type TrackingEvent =
  | "Became Authorized"
  | "Created Account"
  | "Completed Waitlist Form"
  | "Opened Hosted Checkout"
  | "Opened Checkout"
  | "Subscribed"
  | "Reserved Items"
  | "Paused Subscription"
  | "Resumed Subscription"
  | "Entered Active Admin Queue"
  | "Exited Active Admin Queue"
  | "Triaged"
  | "Completed Transaction"

interface CommonTrackProperties {
  firstName: string
  lastName: string
  email: string
  application?: ApplicationType
  customerID?: string
  impactId?: string
}

type BecameAuthorizedProperties = CommonTrackProperties & {
  previousStatus: CustomerStatus
  method: "Manual" | "Automatic"
}

@Injectable()
export class SegmentService {
  client = new Analytics(process.env.SEGMENT_MONSOON_WRITE_KEY)

  track<T>(
    userId: string,
    event: TrackingEvent,
    properties: CommonTrackProperties & T
  ) {
    this.trackEvent<CommonTrackProperties>(userId, event, properties)
  }

  identify(userId: string, traits) {
    try {
      this.client.identify({ userId, traits })
    } catch (err) {
      console.log(err)
      Sentry.captureException(err)
    }
  }

  trackBecameAuthorized(
    userId: string,
    properties: BecameAuthorizedProperties
  ) {
    this.trackEvent<BecameAuthorizedProperties>(userId, "Became Authorized", {
      ...properties,
    })
  }

  trackSubscribed(userId: string, properties: SubscribedProperties) {
    this.trackEvent<
      SubscribedProperties & {
        OrderId: number
        CustomerStatus: "New"
        CurrencyCode: "USD"
        OrderSubTotalPostDiscount: number
      }
    >(userId, "Subscribed", {
      ...properties,
      OrderId: new Date().getTime(),
      CustomerStatus: "New",
      CurrencyCode: "USD",
      OrderSubTotalPostDiscount: 22.5,
    })
  }

  private trackEvent<T>(
    userId: string,
    event: TrackingEvent,
    properties: T & { impactId?: string }
  ) {
    try {
      let context = {}
      let _properties = properties
      if (!!properties.impactId) {
        context = {
          referrer: { type: "impactRadius", id: properties.impactId },
        }
        _properties["orderId"] = new Date().getTime()
      }
      this.client.track({
        userId,
        event,
        properties: _properties,
        context,
      })
      if (process.env.NODE_ENV === "development") {
        console.log(`tracked event`)
        console.log(
          util.inspect(
            { userId, event, properties: _properties },
            { depth: null }
          )
        )
      }
    } catch (err) {
      Sentry.captureException(err)
    }
  }
}
