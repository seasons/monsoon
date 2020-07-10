import { Injectable } from "@nestjs/common"

@Injectable()
export class SyncLocationsService {
  getLocationRecordIdentifier = rec => rec.fields.Slug
}
