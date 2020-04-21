import { Module, forwardRef } from "@nestjs/common"

import { InvoicesLoader } from "."
import { PaymentModule } from "@modules/Payment"

@Module({
  imports: [forwardRef(() => PaymentModule)],
  providers: [InvoicesLoader],
})
export class DataLoaderModule {}
