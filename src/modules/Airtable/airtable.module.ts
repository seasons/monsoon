import { Module } from "@nestjs/common"
import { AirtableService } from "./services/airtable.service"
import { AirtableUtilsService } from "./services/airtable.utils.service"

@Module({
  providers: [AirtableService, AirtableUtilsService],
  exports: [AirtableService],
})
export class AirtableModule {}
