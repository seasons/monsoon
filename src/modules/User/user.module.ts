import { Module } from "@nestjs/common"
import { MeResolver } from "./me.resolver"
import { PrismaModule } from "../../prisma/prisma.module"
import { Strategy } from "passport-jwt"
import { GraphqlAuthGuard } from "./auth.guard"

@Module({
  imports: [PrismaModule],
  providers: [MeResolver, GraphqlAuthGuard],
})
export class UserModule {}
