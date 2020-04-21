import { Invoice, InvoicesDataLoader } from "@modules/Payment/payment.types"

import DataLoader from "dataloader"
import { Injectable } from "@nestjs/common"
import { NestDataLoader } from "@modules/DataLoader/dataloader.types"
import { PaymentService } from "@modules/Payment"
import chargebee from "chargebee"
import { groupBy } from "lodash"

@Injectable()
export class InvoicesLoader implements NestDataLoader {
  generateDataLoader(): InvoicesDataLoader {
    // it should instantiate a data loader each time
    return new DataLoader<string, Invoice[]>(
      this.loadInvoicesForCustomers.bind(this)
    )
  }

  private async loadInvoicesForCustomers(customerIds: string[]) {
    const x = (async () => {
      const allInvoices = (
        await chargebee.invoice
          .list({ "customer_id[in]": `[${customerIds}]` })
          .request()
      )?.list?.map(a => a.invoice)
      const invoicesByCustomerId = groupBy(allInvoices, a => a.customer_id)
      const invoiceArraysInOrder = []
      customerIds.forEach(id => {
        invoiceArraysInOrder.push(invoicesByCustomerId[id])
      })
      return invoiceArraysInOrder
    })()
    return x
  }
}
