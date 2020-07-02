import DataLoader from "dataloader"

export interface NestDataLoader {
  /**
   * Should return a new instance of dataloader each time
   */
  generateDataLoader(generateParams: any): DataLoader<any, any>
}

export interface GenerateParams {
  query: string
  info: string
  format?: (any) => any
}

export interface LoaderParams {
  name: string
  generateParams?: GenerateParams
}
