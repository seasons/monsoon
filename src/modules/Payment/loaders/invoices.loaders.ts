import { Invoice, InvoicesDataLoader } from "@modules/Payment/payment.types"
import { chunk, concat, groupBy } from "lodash"

import DataLoader from "dataloader"
import { Injectable } from "@nestjs/common"
import { NestDataLoader } from "@modules/DataLoader/dataloader.types"
import chargebee from "chargebee"

@Injectable()
export class InvoicesLoader implements NestDataLoader {
  private maxNumCustomerIdsInAPICall = 270 // found through trial and error. 280 fails

  generateDataLoader(): InvoicesDataLoader {
    return new DataLoader<string, Invoice[]>(
      this.loadInvoicesForArbitraryNumberOfCustomers.bind(this)
    )
  }

  private async loadInvoicesForArbitraryNumberOfCustomers(
    customerIds: string[]
  ) {
    return Promise.resolve(
      concat(
        [],
        ...(await Promise.all(
          chunk(
            customerIds,
            // stay a little south of the max to avoid surprises
            this.maxNumCustomerIdsInAPICall - 70
          ).map(async c => this.loadInvoicesForCustomers(c))
        ))
      )
    )
  }

  private async loadInvoicesForCustomers(customerIds: string[]) {
    let offset = "start"
    const allInvoices = []
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
    return customerIds.map(a => invoicesByCustomerId[a])
  }
}
