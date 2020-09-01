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

  // If pulling the info from the graphql execution context, pass this to
  // add a fragment to it.
  infoFragment?: string

  // Given a returned object from prisma, how we do find the associated key or keys.
  // If keyToDataRelationship is "OneToOne" or "OneToMany", pass in getKey.
  // Otherwise, pass in getKeys
  getKey?: (obj: any) => string | null
  getKeys?: (obj: any) => string[] | null

  // Given a set of keys, what is the {where: {}} object to pass into prisma?
  formatWhere?: (keys: string[]) => any

  // Given a returned object from prisma, returns the data in the desired format
  formatData?: (any) => any

  // For a given key, what are we returning?
  // If a single object, "Single" If multiple objects, "Array"
  keyToDataRelationship?: "OneToOne" | "OneToMany" | "ManyToMany"
}

export interface LoaderParams {
  // Should be unique across the application space, because all loaders
  // are stored on the request-level context object
  name?: string

  // Type of the loader. Default value is PrismaLoader.name
  type?: string

  // Defines the prisma query and data mapping process
  params?: GenerateParams

  // pass true to forward the info input passed by the client
  includeInfo?: boolean
}

export interface DataloaderContext {
  dataloaders: Map<string, DataLoader<any, any>>
  getDataLoader: (options: LoaderParams) => DataLoader<any, any>
  req: Request<any>
}
