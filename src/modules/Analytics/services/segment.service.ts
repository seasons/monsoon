import { CustomerStatus } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import * as Sentry from "@sentry/node"
import Analytics from "analytics-node"

type TrackingEvent = "Became Authorized"

interface CommonTrackProperties {
  firstName: string
  lastName: string
}

type BecameAuthorizedProperties = CommonTrackProperties & {
  previousStatus: CustomerStatus
  method: "Manual" | "Automatic"
}

@Injectable()
export class SegmentService {
  client = new Analytics(process.env.SEGMENT_MONSOON_WRITE_KEY)

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
