import { AirtableBaseService, AirtableService, AirtableUtilsService } from "./"

import { Module } from "@nestjs/common"

@Module({
  providers: [AirtableService, AirtableBaseService, AirtableUtilsService],
  exports: [AirtableService],
})
export class AirtableModule {}
