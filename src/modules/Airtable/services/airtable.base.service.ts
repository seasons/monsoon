import * as Airtable from "airtable"

import { Injectable } from "@nestjs/common"

export interface AirtableBaseService {
  base: any
}

@Injectable()
export class AirtableBaseService {
  constructor() {
    this.base = Airtable.base(process.env.AIRTABLE_DATABASE_ID)
  }
}

export class ManualAirtableBaseService {
  base: any

  constructor(databaseID) {
    this.base = Airtable.base(databaseID)
  }
}
