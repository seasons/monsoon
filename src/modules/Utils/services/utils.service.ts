import { InventoryStatus, Location } from "@prisma/index"
import { camelCase, mapKeys, snakeCase, upperFirst } from "lodash"

import { AirtableInventoryStatus } from "@modules/Airtable/airtable.types"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import cliProgress from "cli-progress"
import crypto from "crypto"
import { isObject } from "util"

@Injectable()
export class UtilsService {
  constructor(private readonly prisma: PrismaService) {}

  airtableToPrismaInventoryStatus(
    airtableStatus: AirtableInventoryStatus
  ): InventoryStatus {
    return airtableStatus.replace(" ", "") as InventoryStatus
  }

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

  private caseify = (obj: any, caseFunc: (str: string) => string): any => {
    const a = mapKeys(obj, (_, key) => caseFunc(key))
    for (const [key, val] of Object.entries(a)) {
      if (Array.isArray(val)) {
        a[key] = val.map(b => this.caseify(b, caseFunc))
      } else if (isObject(val) && Object.keys(val)?.length !== 0) {
        a[key] = this.caseify(a, caseFunc)
      }
    }
    return a
  }
}
