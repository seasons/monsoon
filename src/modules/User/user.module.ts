import { Module } from "@nestjs/common"
import { MeResolver } from "./me.resolver"
import { PrismaModule } from "../../prisma/prisma.module"
import { AuthResolver } from "./auth.resolver"
import { AuthService } from "./auth.service"

@Module({
  imports: [PrismaModule],
  providers: [
    AuthService,
    MeResolver,
    AuthResolver
  ],
})
export class UserModule {}
