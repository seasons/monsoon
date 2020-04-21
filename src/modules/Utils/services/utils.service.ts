import * as fs from "fs"

import { camelCase, upperFirst } from "lodash"

import { Injectable } from "@nestjs/common"
import { Location } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import cliProgress from "cli-progress"
import crypto from "crypto"

@Injectable()
export class UtilsService {
  constructor(private readonly prisma: PrismaService) {}

  deleteFieldsFromObject(obj: object, fieldsToDelete: string[]) {
    const objCopy = { ...obj }
    fieldsToDelete.forEach(a => delete objCopy[a])
    return objCopy
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

  Identity(a) {
    return a
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

  snakeToCapitalizedCamelCase(str: string) {
    return upperFirst(camelCase(str))
  }

  secondsSinceEpochToISOString(sec: number): string {
    return new Date(sec * 1000).toISOString()
  }

  openLogFile(logName) {
    return fs.openSync(
      `logs/${logName}-${require("moment")().format(
        "MMMM-Do-YYYY-hh:mm:ss"
      )}.txt`,
      "a"
    )
  }

  writeLines(fileDescriptor, lines: (string | object)[]) {
    lines.forEach(line => {
      let formattedLine = typeof line === "object" ? JSON.stringify(line) : line
      fs.writeSync(fileDescriptor, formattedLine)
      fs.writeSync(fileDescriptor, `\n`)
    })
  }
}
