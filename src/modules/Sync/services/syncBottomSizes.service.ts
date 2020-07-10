import { Injectable } from "@nestjs/common"

@Injectable()
export class SyncBottomSizesService {
  constructor() {}

  getBottomSizeRecordIdentifer = rec =>
    `${rec.fields.Name}${rec.fields.Waist}${rec.fields.Rise}${rec.fields.Hem}${rec.fields.Inseam}`
}
