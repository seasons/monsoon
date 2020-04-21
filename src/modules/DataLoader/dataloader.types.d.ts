import DataLoader from "dataloader"
import { Invoice } from "@modules/Payment/payment.types"

export interface NestDataLoader {
  /**
   * Should return a new instance of dataloader each time
   */
  generateDataLoader(): DataLoader<any, any>
}

export type InvoicesDataLoader = DataLoader<string, Invoice[]>
