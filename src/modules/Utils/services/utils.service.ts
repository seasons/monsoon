import crypto from "crypto"

import { AirtableInventoryStatus } from "@modules/Airtable/airtable.types"
import { Injectable } from "@nestjs/common"
import { InventoryStatus, Location } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"

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
}
