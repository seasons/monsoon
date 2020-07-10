import { Injectable } from "@nestjs/common"

import { AirtableService } from "../../Airtable/services/airtable.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncSizesService {
  getSizeRecordIdentifer = rec => `${rec.fields.Name}${rec.fields.Type}`
}
