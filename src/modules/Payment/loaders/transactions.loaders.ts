import {
  Transaction,
  TransactionsDataLoader,
} from "@modules/Payment/payment.types"

import DataLoader from "dataloader"
import { Injectable } from "@nestjs/common"
import { LoaderUtilsService } from "../services/loader.utils.service"
import { NestDataLoader } from "@modules/DataLoader/dataloader.types"
import { head } from "lodash"

@Injectable()
export class TransactionsLoader implements NestDataLoader {
  constructor(private readonly loaderUtils: LoaderUtilsService) {}

  private maxNumTxnIdsInAPICall = 200 // placeholder. Can look into adjusting if we hit API issues.

  generateDataLoader(): TransactionsDataLoader {
    return new DataLoader<string, Transaction[]>((txnIds: string[]) =>
      this.loaderUtils.loadAllRecordsWIthList({
        maxIds: this.maxNumTxnIdsInAPICall,
        ids: txnIds,
        recordName: "transaction",
        extractFunc: (valsById, id) => head(valsById[id]),
      })
    )
  }
}
