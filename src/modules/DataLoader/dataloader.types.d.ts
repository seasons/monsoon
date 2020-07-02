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
  format?: (any) => any
}

export interface LoaderParams {
  name: string
  type?: string
  generateParams?: GenerateParams
}
