import {
  Transaction,
  TransactionsDataLoader,
} from "@modules/Payment/payment.types"

import DataLoader from "dataloader"
import { Injectable } from "@nestjs/common"
import { LoaderUtilsService } from "../services/loader.utils.service"
import { NestDataLoader } from "@modules/DataLoader/dataloader.types"

@Injectable()
export class TransactionsForCustomersLoader implements NestDataLoader {
  constructor(private readonly loaderUtils: LoaderUtilsService) {}

  private maxNumCustomerIdsInAPICall = 270 // based on 270 number found by trial and error for invoice loader

  generateDataLoader(): TransactionsDataLoader {
    return new DataLoader<string, Transaction[]>((customerIds: string[]) =>
      this.loaderUtils.loadAllRecordsWIthList({
        maxIds: this.maxNumCustomerIdsInAPICall,
        ids: customerIds,
        filterKey: `customer_id[in]`,
        recordName: "transaction",
        groupFunc: a => a.customer_id,
      })
    )
  }
}
