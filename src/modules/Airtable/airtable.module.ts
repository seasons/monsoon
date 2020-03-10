import { Module } from "@nestjs/common"
import { AirtableService } from "./services/airtable.service"
import { AirtableUtilsService } from "./services/airtable.utils.service"
import { AirtableBaseService } from "./services/airtable.base.service"

@Module({
  providers: [AirtableService, AirtableBaseService, AirtableUtilsService],
  exports: [AirtableService],
})
export class AirtableModule {}
