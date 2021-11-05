import { Injectable } from "@nestjs/common"
import moment from "moment"

// TODO: Move over time related util functions from utils.service
@Injectable()
export class TimeUtilsService {
  constructor() {}

  getLaterDate(date1: Date, date2: Date) {
    if (date1.getTime() - date2.getTime() >= 0) {
      return date1
    }
    return date2
  }

  isLaterDate(date1: Date, date2: Date) {
    return date1.getTime() - date2.getTime() >= 0
  }

  isBetweenDates(date: Date, startDate: Date, endDate: Date) {
    return (
      date.getTime() - startDate.getTime() >= 0 &&
      date.getTime() - endDate.getTime() <= 0
    )
  }
  xDaysBeforeDate(
    date: Date,
    x: number,
    returnType: "isoString" | "timestamp" | "date" = "isoString"
  ) {
    const returnDate = moment(date.toISOString()).subtract(x, "days")

    return this.formatDate(returnDate, returnType)
  }

  // Returns an ISO string for a date that's X days ago
  xDaysAgoISOString(x: number) {
    return moment().subtract(x, "days").format()
  }

  xDaysFromNowISOString(x: number) {
    return moment().add(x, "days").format()
  }

  xDaysAfterDate(
    date: Date,
    x: number,
    returnType: "isoString" | "timestamp" | "date" = "isoString"
  ) {
    const returnDate = moment(date.toISOString()).add(x, "days")

    return this.formatDate(returnDate, returnType)
  }

  private formatDate(
    date: moment.Moment,
    returnType: "isoString" | "timestamp" | "date"
  ) {
    switch (returnType) {
      case "isoString":
        return date.format()
      case "timestamp":
        return date.utc().format("X")
      case "date":
        return date.toDate()
      default:
        throw `Invalid return type: ${returnType}`
    }
  }

  secondsSinceEpoch(date: Date) {
    return Math.round(date.getTime() / 1000)
  }

  numDaysBetween(date1: Date, date2: Date) {
    let beforeDate, afterDate
    if (this.isLaterDate(date1, date2)) {
      beforeDate = date2
      afterDate = date1
    } else {
      beforeDate = date1
      afterDate = date2
    }

    // Don't use the times to keep the day diff clean
    const before = moment(
      new Date(
        beforeDate.getFullYear(),
        beforeDate.getMonth(),
        beforeDate.getDate()
      )
    )
    const after = moment(
      new Date(
        afterDate.getFullYear(),
        afterDate.getMonth(),
        afterDate.getDate()
      )
    )

    return after.diff(before, "days")
  }

  dateFromUTCTimestamp(
    timestamp,
    unit: "seconds" | "milliseconds" = "seconds"
  ): Date {
    const multiplier = unit === "seconds" ? 1000 : 1
    return new Date(timestamp * multiplier)
  }

  UTCTimestampFromDate(
    date: Date,
    unit: "seconds" | "milliseconds" = "seconds"
  ) {
    const divider = unit === "seconds" ? 1000 : 1
    return date.getTime() / divider
  }

  // pass in an ISO datestring
  isLessThanXDaysFromNow(dateString: string, x: number) {
    var date = moment(dateString)
    return (
      date.isSameOrBefore(moment().add(x, "days")) &&
      date.isSameOrAfter(moment())
    )
  }

  // pass in an ISO datestring
  isXOrMoreDaysFromNow(dateString: string, x: number) {
    var date = moment(dateString)
    return date.isSameOrAfter(moment().add(x, "days"))
  }
}
