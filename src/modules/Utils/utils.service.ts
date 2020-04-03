import { Injectable } from "@nestjs/common"
import crypto from "crypto"
import util from "util"
import { InventoryStatus, Location } from "../../prisma/"
import { PrismaService } from "../../prisma/prisma.service"
import { AirtableInventoryStatus } from "../Airtable/airtable.types"

@Injectable()
export class UtilsService {
  constructor(private readonly prisma: PrismaService) {}

  airtableToPrismaInventoryStatus(
    airtableStatus: AirtableInventoryStatus
  ): InventoryStatus {
    let prismaStatus
    if (airtableStatus === "Reservable") {
      prismaStatus = "Reservable"
    }
    if (airtableStatus === "Non Reservable") {
      prismaStatus = "NonReservable"
    }
    if (airtableStatus === "Reserved") {
      prismaStatus = "Reserved"
    }
    return prismaStatus
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
    let hex = cipher.update(userID, "utf8", "hex")
    hex += cipher.final("hex")
    return hex
  }

  decryptUserIDHash(hex: string): string {
    const decipher = crypto.createDecipher(
      "aes-128-ctr",
      `${process.env.HASH_SECRET}`
    )
    let idHash = decipher.update(hex, "hex", "utf8")
    idHash += decipher.final("utf8")
    return idHash
  }

  Identity(a) {
    return a
  }
}
