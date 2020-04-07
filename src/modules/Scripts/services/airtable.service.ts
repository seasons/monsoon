import * as Airtable from "airtable"

export class OverridableAirtableBaseService {
  base: any

  constructor(databaseID) {
    this.base = Airtable.base(databaseID)
  }
}
