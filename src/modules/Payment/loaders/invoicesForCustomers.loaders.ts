import { NestDataLoader } from "@modules/DataLoader/dataloader.types"
import { Injectable } from "@nestjs/common"
import DataLoader from "dataloader"
import { identity, lowerFirst, mapKeys } from "lodash"

import { Invoice, InvoicesDataLoader } from "../payment.types"
import { LoaderUtilsService } from "../services/loader.utils.service"

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
        groupFunc: (a) => a.customerId,
        transformFunc: (a) =>
          identity({
            ...a,
            issuedCreditNotes: a.issuedCreditNotes?.map((b) =>
              mapKeys(b, (_, key) => lowerFirst(key.replace("cn", "")))
            ),
          }),
      })
    )
  }
}
