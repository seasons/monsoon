import {
  Transaction,
  TransactionsDataLoader,
} from "@modules/Payment/payment.types"
import { chunk, concat, groupBy, head } from "lodash"

import DataLoader from "dataloader"
import { Injectable } from "@nestjs/common"
import { NestDataLoader } from "@modules/DataLoader/dataloader.types"
import chargebee from "chargebee"

@Injectable()
export class TransactionsLoader implements NestDataLoader {
  private maxNumTxnIdsInAPICall = 200 // placeholder. Can look into adjusting if we hit API issues.

  generateDataLoader(): TransactionsDataLoader {
    return new DataLoader<string, Transaction[]>(
      this.loadArbitraryNumberOfTrasnactions.bind(this)
    )
  }

  private async loadArbitraryNumberOfTrasnactions(txnIds: string[]) {
    return Promise.resolve(
      concat(
        [],
        ...(await Promise.all(
          chunk(
            txnIds,
            // stay a little south of the max to avoid surprises
            this.maxNumTxnIdsInAPICall
          ).map(async c => this.loadTransactions(c))
        ))
      )
    )
  }

  private async loadTransactions(txnIds: string[]) {
    let offset = "start"
    const allTransactions = []
    while (true) {
      let list
      ;({ next_offset: offset, list } = await chargebee.transaction
        .list({
          "id[in]": `[${txnIds}]`,
          limit: 100,
          ...(offset === "start" ? {} : { offset }),
        })
        .request())
      allTransactions.push(...list?.map(a => a.transaction))
      if (!offset) {
        break
      }
    }

    const transactionsByTxnId = groupBy(allTransactions, a => a.id)
    return txnIds.map(a => head(transactionsByTxnId[a]))
  }
}
