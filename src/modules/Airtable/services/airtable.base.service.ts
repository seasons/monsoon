import * as Airtable from "airtable"

import { Injectable } from "@nestjs/common"
import { UpdatableConnection } from "@app/modules/index.types"

@Injectable()
export class AirtableBaseService implements UpdatableConnection {
  base = Airtable.base(process.env.AIRTABLE_DATABASE_ID)

  updateConnection({ id }) {
    this.base = Airtable.base(id)
  }
}
