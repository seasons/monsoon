import { Module } from "@nestjs/common"

import { AirtableBaseService, AirtableService, AirtableUtilsService } from "./"

@Module({
  providers: [AirtableService, AirtableBaseService, AirtableUtilsService],
  exports: [AirtableService],
})
export class AirtableModule {}
