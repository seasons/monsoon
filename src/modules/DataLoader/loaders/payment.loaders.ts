import { InvoicesDataLoader, NestDataLoader } from "../dataloader.types"

import DataLoader from "dataloader"
import { Injectable } from "@nestjs/common"
import { Invoice } from "@modules/Payment/payment.types"
import { PaymentService } from "@modules/Payment"

@Injectable()
export class InvoicesLoader implements NestDataLoader {
  constructor(private readonly paymentService: PaymentService) {}

  generateDataLoader(): InvoicesDataLoader {
    // it should instantiate a data loader each time
    return new DataLoader<string, Invoice[]>(
      this.paymentService.loadInvoicesForCustomers.bind(this.paymentService)
    )
  }
}
