import { Module } from "@nestjs/common"

import { ErrorService } from "./services/error.service"

@Module({
  providers: [ErrorService],
  exports: [ErrorService],
})
export class ErrorModule {}
