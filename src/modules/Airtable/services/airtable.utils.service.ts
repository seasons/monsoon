import { Injectable } from "@nestjs/common"
import * as Airtable from "airtable"

export interface AirtableUtilsService {
  base: any
}

export interface AirtableRecord {
  id: string
  fields: any
}

@Injectable()
export class AirtableUtilsService {
  constructor() {
    this.base = Airtable.base(process.env.AIRTABLE_DATABASE_ID)
  }

  getAirtableUserRecordByUserEmail(
    email: string
  ): Promise<{ id: string; fields: any }> {
    return new Promise((resolve, reject) => {
      this.base("Users")
        .select({
          view: "Grid view",
          filterByFormula: `{Email}='${email}'`,
        })
        .firstPage((err, records) => {
          if (records.length > 0) {
            const user = records[0]
            resolve(user)
          } else {
            reject(err)
          }
        })
    })
  }

  async getAirtableLocationRecordBySlug(slug: string): Promise<AirtableRecord> {
    return new Promise((resolve, reject) => {
      this.base("Locations")
        .select({ view: "Grid view", filterByFormula: `{Slug}='${slug}'` })
        .firstPage((err, records) => {
          if (err) return reject(err)
          if (records.length > 0) return resolve(records[0])
          return reject(`No record found with slug ${slug}`)
        })
    })
  }
}
