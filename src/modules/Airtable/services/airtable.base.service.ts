import { UpdatableConnection } from "@app/modules/index.types"
import { Injectable } from "@nestjs/common"
import * as Airtable from "airtable"

@Injectable()
export class AirtableBaseService implements UpdatableConnection {
  base = Airtable.base(process.env.AIRTABLE_DATABASE_ID)

  updateConnection({ id }) {
    this.base = Airtable.base(id)
  }
}
