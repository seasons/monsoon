import { Module } from "@nestjs/common"
import { MeResolver } from "./me.resolver"

@Module({
  providers: [MeResolver],
})
export class MeModule {}
