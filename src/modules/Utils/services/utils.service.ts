import crypto from "crypto"
import * as fs from "fs"

import { Injectable } from "@nestjs/common"
import { Location } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import cliProgress from "cli-progress"
import { camelCase, isObject, mapKeys, snakeCase } from "lodash"
import moment from "moment"

import { bottomSizeRegex } from "../../Product/constants"

enum ProductSize {
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
}

@Injectable()
export class UtilsService {
  constructor(private readonly prisma: PrismaService) {}

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

  isXDaysBefore({
    beforeDate,
    afterDate,
    numDays,
  }: {
    beforeDate: Date
    afterDate: Date
    numDays: number
  }): boolean {
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
    const prismaLocation = await this.prisma.client.location({
      slug,
    })
    if (!prismaLocation) {
      throw Error(`no location with slug ${slug} found in DB`)
    }

    return prismaLocation
  }

  formatReservationReturnDate(reservationCreatedAtDate: Date) {
    const returnDate = new Date(reservationCreatedAtDate)
    returnDate.setDate(reservationCreatedAtDate.getDate() + 30)
    return returnDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
    }

    // If we get here, we're expecting a bottom with size WxL e.g 32x28 or 27x8
    if (!sizeName.match(bottomSizeRegex)) {
      throw new Error(`invalid sizeName: ${sizeName}`)
    }
    return sizeName.toLowerCase().replace("x", "") // 32x28 => 3238
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
}
