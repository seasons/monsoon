import { Module, forwardRef } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { CustomerFieldsResolver } from "./fields/customer.fields.resolver"
import { CustomerQueriesResolver } from "./queries/customer.queries.resolver"
import { AdmissionsService } from "./services/admissions.service"
import { PaymentModule } from ".."

@Module({
  imports: [PrismaModule, forwardRef(() => PaymentModule)],
  providers: [
    CustomerQueriesResolver,
    CustomerFieldsResolver,
    AdmissionsService,
  ],
})
export class CustomerModule {}
