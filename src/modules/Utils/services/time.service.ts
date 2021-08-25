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

  numDaysBetween(date1, date2) {
    let beforeDate, afterDate
    if (this.isLaterDate(date1, date2)) {
      beforeDate = date2
      afterDate = date1
    } else {
      beforeDate = date1
      afterDate = date2
    }

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
}
