import crypto from "crypto"
import * as fs from "fs"

import { UTMData as BindingUTMData, DateTime } from "@app/prisma/prisma.binding"
import { Injectable } from "@nestjs/common"
import { AdminActionLog } from "@prisma/client"
import { Location } from "@prisma/client"
import { UTMData } from "@prisma/client"
import { Reservation } from "@prisma/client"
import {
  PauseRequest,
  AdminActionLog as PrismaOneAdminActionLog,
  SyncTimingType,
} from "@prisma1/index"
import { PrismaService } from "@prisma1/prisma.service"
import cliProgress from "cli-progress"
import graphqlFields from "graphql-fields"
import {
  camelCase,
  get,
  head,
  isObject,
  mapKeys,
  omit,
  snakeCase,
} from "lodash"
import moment from "moment"
import states from "us-state-converter"

import { bottomSizeRegex } from "../../Product/constants"
import { QueryUtilsService } from "./queryUtils.service"

enum ProductSize {
  XXS = "XXS",
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
  XXXL = "XXXL",
  Universal = "Universal",
}

// TODO: As needed, support other types. We just need to update the code
// that filters out computed fields
type InfoStringPath = "user" | "customer"

@Injectable()
export class UtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryUtils: QueryUtilsService
  ) {}

  formatUTMForSegment = (utm: UTMData) => ({
    utm_source: utm?.source,
    utm_content: utm?.content,
    utm_medium: utm?.medium,
    utm_campaign: utm?.campaign,
    utm_term: utm?.term,
  })

  abbreviateState(state: string) {
    let abbr
    const _state = state?.trim()

    // this particular library doesn't handle Oregon for whichever reason.
    // So we handle it independently
    if (_state === "Oregon") {
      abbr = "OR"
    } else {
      abbr = states.abbr(_state)
    }

    return abbr
  }

  // Returns an ISO string for a date that's X days ago
  xDaysAgoISOString(x: number) {
    return moment().subtract(x, "days").format()
  }

  xDaysFromNowISOString(x: number) {
    return moment().add(x, "days").format()
  }

  randomString() {
    return Math.random().toString(36).slice(2)
  }

  dateSort(dateOne: DateTime, dateTwo: DateTime) {
    return moment(dateOne).isAfter(moment(dateTwo)) ? -1 : 1
  }

  isXDaysBefore({
    beforeDate,
    afterDate,
    numDays,
  }: {
    beforeDate: Date
    afterDate: Date
    numDays: number
  }): boolean {
    if (beforeDate === null || afterDate === null) {
      return false
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
    return before.isBefore(after) && after.diff(before, "days") === numDays
  }

  // pass in an ISO datestring
  isLessThanXDaysFromNow(dateString: string, x: number) {
    var date = moment(dateString)
    return (
      date.isSameOrBefore(moment().add(x, "days")) &&
      date.isSameOrAfter(moment())
    )
  }

  isSameDay(first: Date, second: Date) {
    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    )
  }

  async getPrismaLocationFromSlug(slug: string): Promise<Location> {
    const prismaLocation = await this.prisma.client2.location.findUnique({
      where: { slug },
    })
    if (!prismaLocation) {
      throw Error(`no location with slug ${slug} found in DB`)
    }

    return prismaLocation
  }

  getReservationReturnDate(
    reservation: Pick<Reservation, "receivedAt" | "createdAt">
  ) {
    let returnDate
    let returnOffset
    if (reservation.receivedAt !== null) {
      returnDate = reservation.receivedAt
      returnOffset = 30
    } else {
      const daysSinceReservationCreated = moment().diff(
        moment(reservation.createdAt),
        "days"
      )
      if (daysSinceReservationCreated < 15) {
        return null
      } else {
        // If for some reason we have not been able to set receivedAt 15 days in,
        // default to 35 days after createdAt. This assumes a 5 day shipping time.
        returnDate = reservation.createdAt
        returnOffset = 35
      }
    }
    returnDate.setDate(returnDate.getDate() + returnOffset)

    return returnDate
  }

  encryptUserIDHash(userID: string): string {
    const cipher = crypto.createCipher(
      "aes-128-ctr",
      `${process.env.HASH_SECRET}`
    )
    let hash = cipher.update(userID, "utf8", "hex")
    hash += cipher.final("hex")
    return hash
  }

  decryptUserIDHash(hash: string): string {
    const decipher = crypto.createDecipher(
      "aes-128-ctr",
      `${process.env.HASH_SECRET}`
    )
    let decryptedHash = decipher.update(hash, "hex", "utf8")
    decryptedHash += decipher.final("utf8")
    return decryptedHash
  }

  weightedCoinFlip(pHeads) {
    if (pHeads < 0 || pHeads > 1) {
      throw new Error("pHeads must be between 0 and 1 exclusive")
    }
    return Math.random() < pHeads ? "Heads" : "Tails"
  }

  makeCLIProgressBar(format?: string) {
    return new cliProgress.MultiBar(
      {
        clearOnComplete: false,
        hideCursor: true,
        format:
          format ||
          `{modelName} {bar} {percentage}%  ETA: {eta}s  {value}/{total} ops`,
      },
      cliProgress.Presets.shades_grey
    )
  }

  /**
   * Recursively transform all object keys to camelCase
   */
  camelCaseify = (obj: any): any => {
    return this.caseify(obj, camelCase)
  }

  /**
   * Recursively transform all object keys to snakeCase
   */
  snakeCaseify = (obj: any): any => {
    return this.caseify(obj, snakeCase)
  }

  secondsSinceEpochToISOString(sec: number, nullifError = false): string {
    try {
      return new Date(sec * 1000).toISOString()
    } catch (err) {
      if (nullifError) {
        return null
      } else {
        throw err
      }
    }
  }

  openLogFile(logName) {
    if (!fs.existsSync(`logs`)) {
      fs.mkdirSync(`logs`)
    }
    const a = fs.openSync(
      `logs/${logName}-${require("moment")().format(
        "MMMM-Do-YYYY-hh:mm:ss"
      )}.txt`,
      "a"
    )
    fs.writeSync(a, "Begin Log\n")
    return a
  }

  writeLines(fileDescriptor, lines: (string | object)[]) {
    lines.forEach(line => {
      let formattedLine = typeof line === "object" ? JSON.stringify(line) : line
      fs.writeSync(fileDescriptor, formattedLine)
      fs.writeSync(fileDescriptor, `\n`)
    })
  }

  filterErrors<T>(arr: any[]): T[] {
    return arr?.filter(a => !(a instanceof Error))
  }

  sizeNameToSizeCode(sizeName: ProductSize | string) {
    switch (sizeName) {
      case ProductSize.XXS:
        return "XXS"
      case ProductSize.XS:
        return "XS"
      case ProductSize.S:
        return "SS"
      case ProductSize.M:
        return "MM"
      case ProductSize.L:
        return "LL"
      case ProductSize.XL:
        return "XL"
      case ProductSize.XXL:
        return "XXL"
      case ProductSize.XXXL:
        return "XXXL"
      case ProductSize.Universal:
        return "UNI"
    }

    // If we get here, we're expecting a bottom with size WxL e.g 32x28 or 27x8
    if (!sizeName.match(bottomSizeRegex)) {
      throw new Error(`invalid sizeName: ${sizeName}`)
    }
    return sizeName.toLowerCase().replace("x", "") // 32x28 => 3238
  }

  /**
   * Returns a JSON object containing the contents of the file located
   * at the given path
   *
   * @param path path of the json file relative to the applications's root
   */
  parseJSONFile = (path: string) => {
    return JSON.parse(fs.readFileSync(process.cwd() + `/${path}.json`, "utf-8"))
  }

  // Get a select object for a field nested somewhere inside the info object
  getSelectFromInfoAt = (info, path: InfoStringPath) => {
    if (typeof info === "string") {
      throw new Error(`Unable to parse string info. Need to implement.`)
    }

    let fieldsToIgnore = []
    if (["user", "customer"].includes(path)) {
      fieldsToIgnore = this.getFieldsToIgnore(path)
    }

    const fields = graphqlFields(info)
    const subField = get(fields, path)
    if (subField === undefined) {
      return null
    }
    const modelName = path === "user" ? "User" : "Customer"
    return QueryUtilsService.fieldsToSelect(
      fields,
      PrismaService.modelFieldsByModelName,
      modelName
    )
  }

  private getFieldsToIgnore = (field: InfoStringPath | string) => {
    let fields = []

    // TODO: Ideally, these lists should come from the properties
    // of the respective field resolver classes. If we move towards
    // using this function more often, we should update that. We
    // hardcode it for now because using the actual classes caused
    // cyclical import errors
    switch (field) {
      case "user":
        fields = [
          "beamsToken",
          "links",
          "fullName",
          "customer",
          "completeAccountURL",
        ]
        break
      case "customer":
        fields = [
          "onboardingSteps",
          "invoices",
          "transactions",
          "shouldRequestFeedback",
          "coupon",
          "paymentPlan",
        ]
        break
    }
    return fields
  }

  private fieldsToInfoString = (fields: any, fieldsToIgnore: string[]) => {
    // Base case
    if (Object.keys(fields).length === 0) {
      return ``
    }

    // Recursive case
    let string = `{`
    const keys = Object.keys(fields)
    for (const key of keys) {
      if (fieldsToIgnore.includes(key)) {
        continue
      }
      string += ` ${key}`
      const subFields = this.fieldsToInfoString(
        fields[key],
        this.getFieldsToIgnore(key)
      )
      if (subFields === "") {
        continue
      }
      string += ` ${subFields}`
    }
    return string + ` }`
  }

  getLatestPauseRequest = (customer): PauseRequest => {
    const latestPauseRequest = head(
      customer.membership.pauseRequests.sort((a, b) =>
        this.dateSort(a.createdAt, b.createdAt)
      )
    ) as PauseRequest

    return latestPauseRequest
  }

  getLatestReservation = (customer): Reservation => {
    const latestResy = head(
      customer.reservations.sort((a, b) =>
        this.dateSort(a.createdAt, b.createdAt)
      )
    ) as Reservation

    return latestResy
  }

  getPauseWithItemsPlanId = membership => {
    const itemCount = membership?.plan?.itemCount
    let planID
    if (itemCount === 1) {
      planID = "pause-1"
    } else if (itemCount === 2) {
      planID = "pause-2"
    } else if (itemCount === 3) {
      planID = "pause-3"
    }
    return planID
  }

  filterAdminLogs(
    logs: AdminActionLog[] | PrismaOneAdminActionLog[],
    ignoreKeys = []
  ) {
    const isEmptyUpdate = b =>
      b.action === "Update" && Object.keys(b.changedFields).length === 0

    return (
      logs
        //@ts-ignore
        .map(a => ({ ...a, changedFields: omit(a.changedFields, ignoreKeys) }))
        .filter(b => !isEmptyUpdate(b))
    )
  }

  private caseify = (obj: any, caseFunc: (str: string) => string): any => {
    // Need this to prevent strings from getting turned into objects
    if (typeof obj === "string") {
      return obj
    }

    // caseify keys of the object
    const a = mapKeys(obj, (_, key) => caseFunc(key))

    // if obj values are arrays or objects, recursively caseify
    for (const [key, val] of Object.entries(a)) {
      if (Array.isArray(val)) {
        a[key] = val.map(b => this.caseify(b, caseFunc))
      } else if (isObject(val) && Object.keys(val)?.length !== 0) {
        a[key] = this.caseify(val, caseFunc)
      }
    }
    return a
  }

  async getSyncTimingsRecord(type: SyncTimingType) {
    const syncTiming = await this.prisma.client2.syncTiming.findFirst({
      where: { type },
      orderBy: { createdAt: "desc" },
    })

    if (!syncTiming) {
      throw new Error(
        `No sync timing records found for type: ${type}. Please seed initial record`
      )
    }

    return this.prisma.sanitizePayload(syncTiming, "SyncTiming")
  }
}
