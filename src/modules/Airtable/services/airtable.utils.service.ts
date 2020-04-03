import { Injectable } from "@nestjs/common"
import { LocationCreateInput, BillingInfoCreateInput } from "../../../prisma"
import { AirtableBaseService } from "./airtable.base.service"
import { head } from "lodash"

interface AirtableRecord {
  id: string
  fields: any
}

@Injectable()
export class AirtableUtilsService {
  constructor(private readonly airtableBase: AirtableBaseService) {}

  readonly keyMap = {
    phoneNumber: "Phone Number",
    birthday: "Birthday",
    height: "Height",
    weight: "Weight",
    bodyType: "Body Type",
    averageTopSize: "Average Top Size",
    averageWaistSize: "Average Waist Size",
    averagePantLength: "Average Pant Length",
    preferredPronouns: "Preferred Pronouns",
    profession: "Profession",
    partyFrequency: "Party Frequency",
    travelFrequency: "Travel Frequency",
    shoppingFrequency: "Shopping Frequency",
    averageSpend: "Average Spend",
    style: "Style",
    commuteStyle: "Commute Style",
    shippingAddress: "Shipping Address",
    phoneOS: "Platform OS",
    status: "Status",
    plan: "Plan",
  }

  async createLocation(data: LocationCreateInput) {
    const createData = [
      {
        fields: {
          Name: data.name,
          Company: data.company,
          "Address 1": data.address1,
          "Address 2": data.address2,
          City: data.city,
          State: data.state,
          "Zip Code": data.zipCode,
          Slug: data.slug,
          "Location Type": data.locationType,
        },
      },
    ]

    return this.airtableBase.base("Locations").create(createData)
  }

  async createBillingInfo(data: BillingInfoCreateInput) {
    return this.airtableBase.base("BillingInfos").create({
      Brand: data.brand,
      Name: data.name,
      LastDigits: data.last_digits,
      "Expiration Month": data.expiration_month,
      "Expiration Year": data.expiration_year,
      "Street 1": data.street1,
      "Street 2": data.street2,
      City: data.city,
      State: data.state,
      Country: data.country,
      "Postal Code": data.postal_code,
    })
  }

  async getAirtableUserRecordByUserEmail(
    email: string
  ): Promise<{ id: string; fields: any }> {
    return head(
      await this.airtableBase
        .base("Users")
        .select({
          view: "Grid view",
          filterByFormula: `{Email}='${email}'`,
        })
        .firstPage()
    )
  }

  async getAirtableLocationRecordBySlug(slug: string): Promise<AirtableRecord> {
    return new Promise((resolve, reject) => {
      this.airtableBase
        .base("Locations")
        .select({ view: "Grid view", filterByFormula: `{Slug}='${slug}'` })
        .firstPage((err, records) => {
          if (err) return reject(err)
          if (records.length > 0) return resolve(records[0])
          return reject(`No record found with slug ${slug}`)
        })
    })
  }
}
