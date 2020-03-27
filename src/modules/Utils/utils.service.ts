import crypto from "crypto"
import { Injectable } from "@nestjs/common"
import { Location, InventoryStatus } from "../../prisma/"
import { AirtableInventoryStatus } from "../Airtable/airtable.types"
import { PrismaService } from "../../prisma/prisma.service"

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

  getUserIDHash(userID: string): string {
    return crypto
      .createHash("sha256")
      .update(`${userID}${process.env.HASH_SECRET}`)
      .digest("hex")
  }

  Identity(a) {
    return a
  }
}
