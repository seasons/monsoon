import DataLoader from "dataloader"
import { Request } from "express"

export interface NestDataLoader {
  /**
   * Should return a new instance of dataloader each time
   */
  generateDataLoader(generateParams: any): DataLoader<any, any>
}
export type GenerateParamsInfo = string

export interface GenerateParams {
  query: string
  info?: GenerateParamsInfo
  infoFragment?: string
  getKey?: (obj: any) => string | null
  formatWhere?: (ids: string[]) => any
  formatData?: (any) => any
}

export interface LoaderParams {
  // Should be unique across the application space, because all loaders
  // are stored on the request-level context object
  name?: string
  type: string
  params?: GenerateParams
  includeInfo?: boolean
}

export interface DataloaderContext {
  dataloaders: Map<string, DataLoader<any, any>>
  getDataLoader: (options: LoaderParams) => DataLoader<any, any>
  req: Request<any>
}
