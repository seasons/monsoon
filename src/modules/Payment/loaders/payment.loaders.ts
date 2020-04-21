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
    return new DataLoader<string, Invoice[]>(
      this.loadInvoicesForCustomers.bind(this)
    )
  }

  private async loadInvoicesForCustomers(customerIds: string[]) {
    const allInvoices = []
    let offset = "start"
    while (true) {
      let list
      ;({ next_offset: offset, list } = await chargebee.invoice
        .list({
          "customer_id[in]": `[${customerIds}]`,
          limit: 100,
          ...(offset === "start" ? {} : { offset }),
        })
        .request())
      allInvoices.push(...list?.map(a => a.invoice))
      if (!offset) {
        break
      }
    }

    const invoicesByCustomerId = groupBy(allInvoices, a => a.customer_id)
    return Promise.resolve(customerIds.map(a => invoicesByCustomerId[a]))
  }
}
