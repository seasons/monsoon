import { Invoice, InvoicesDataLoader } from "../payment.types"

import DataLoader from "dataloader"
import { Injectable } from "@nestjs/common"
import { LoaderUtilsService } from "../services/loader.utils.service"
import { NestDataLoader } from "@modules/DataLoader/dataloader.types"

@Injectable()
export class InvoicesForCustomersLoader implements NestDataLoader {
  constructor(private readonly loaderUtils: LoaderUtilsService) {}

  private maxNumCustomerIdsInAPICall = 270 // found through trial and error. 280 fails

  generateDataLoader(): InvoicesDataLoader {
    return new DataLoader<string, Invoice[]>((customerIds: string[]) =>
      this.loaderUtils.loadAllRecordsWIthList({
        maxIds: this.maxNumCustomerIdsInAPICall,
        filterKey: "customer_id[in]",
        ids: customerIds,
        recordName: "invoice",
        groupFunc: a => a.customerId,
      })
    )
  }
}
