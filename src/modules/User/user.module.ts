import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { AuthMutationsResolver } from "./mutations/auth.mutations"
import { AuthService } from "./services/auth.service"
import { MeQueriesResolver } from "./queries/me.queries"
import { MeFieldsResolver } from "./fields/me.fields"
import { CustomerFieldsResolver } from "./fields/customer.fields"

@Module({
  imports: [PrismaModule],
  providers: [
    AuthService,
    CustomerFieldsResolver,
    MeFieldsResolver,
    MeQueriesResolver,
    AuthMutationsResolver
  ],
  exports: [AuthService],
})
export class UserModule { }
