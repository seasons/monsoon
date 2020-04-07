import { ErrorService } from "./services/error.service"
import { Module } from "@nestjs/common"

@Module({
  providers: [ErrorService],
  exports: [ErrorService],
})
export class ErrorModule {}
