import { Module } from "@nestjs/common"
import { AirtableService, AirtableBaseService, AirtableUtilsService } from "."

@Module({
  providers: [AirtableService, AirtableBaseService, AirtableUtilsService],
  exports: [AirtableService],
})
export class AirtableModule {}
