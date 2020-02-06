import { Module } from "@nestjs/common"
import { HomepageResolver } from "./homepage.resolver"

@Module({
  providers: [HomepageResolver],
})
export class HomepageModule {}
