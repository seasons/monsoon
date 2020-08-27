import { ApplicationType } from "@app/decorators/application.decorator"
import { CustomerStatus } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import * as Sentry from "@sentry/node"
import Analytics from "analytics-node"

type TrackingEvent =
  | "Became Authorized"
  | "Created Account"
  | "Completed Waitlist Form"
  | "Opened Hosted Checkout"
  | "Opened Checkout"
  | "Subscribed"
  | "Reserved Items"

interface CommonTrackProperties {
  firstName: string
  lastName: string
  email: string
  application?: ApplicationType
  customerID?: string
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
      Sentry.captureException(err)
    }
  }

  trackBecameAuthorized(
    userId: string,
    properties: BecameAuthorizedProperties
  ) {
    this.trackEvent<BecameAuthorizedProperties>(
      userId,
      "Became Authorized",
      properties
    )
  }

  private trackEvent<T>(userId: string, event: TrackingEvent, properties: T) {
    try {
      this.client.track({
        userId,
        event,
        properties,
      })
    } catch (err) {
      Sentry.captureException(err)
    }
  }
}
