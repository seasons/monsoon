import DataLoader from "dataloader"

export interface NestDataLoader {
  /**
   * Should return a new instance of dataloader each time
   */
  generateDataLoader(generateParams: any): DataLoader<any, any>
}
export type GenerateParamsInfo = string | "FROM_CONTEXT"

export interface GenerateParams {
  query: string
  info: GenerateParamsInfo
  getKey?: (obj: any) => string | null
  formatWhere?: (ids: string[]) => any
  formatData?: (any) => any
}

export interface LoaderParams {
  // Should be unique across the application space, because all loaders
  // are stored on the request-level context object
  type: string
  generateParams?: GenerateParams
}
