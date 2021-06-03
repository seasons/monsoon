import { Prisma } from "@prisma/client"
import DataLoader from "dataloader"
import { Request } from "express"
import { GraphQLResolveInfo } from "graphql"

export interface NestDataLoader {
  /**
   * Should return a new instance of dataloader each time
   */
  generateDataLoader(generateParams: any): DataLoader<any, any>
}

type KeyToDataRelationship = "OneToOne" | "OneToMany" | "ManyToMany"

export type PrismaOneGenerateParams = CommonPrismaGenerateParams & {
  // basic parameters to construct the prisma call
  query: string
  info?: string | any
}

export type PrismaTwoGenerateParams = CommonPrismaGenerateParams & {
  // basic parameters to construct the prisma call
  model: Prisma.ModelName
  select?: any
}

interface CommonPrismaGenerateParams {
  ctx?: any
  orderBy?: any

  // if a given key does not resolve to any return value, what should we return?
  fallbackValue?: any

  // Given a set of keys, what is where clause to pass into prisma?
  // For example, the function (keys) => {id: {in: keys}} would result in a query input of {where: {id: {in: keys}}}
  formatWhere?: (keys: string[], ctx: any) => any

  // If pulling the info from the graphql execution context, pass this to
  // add a fragment to it.
  infoFragment?: string

  // Given a returned object from prisma, how we do find the associated keys?
  // If there's only key per returned object, return a length 1 array.
  getKeys?: (obj: any) => string[] | null

  // Given a returned object from prisma, returns the data in the desired format
  formatData?: (any) => any

  // For a given key, what are we returning?
  // If a single object, "Single" If multiple objects, "Array"
  keyToDataRelationship?: KeyToDataRelationship
}
export interface LoaderParams {
  // Should be unique across the application space, because all loaders
  // are stored on the request-level context object
  name?: string

  // Type of the loader. Default value is PrismaLoader.name
  type?: string

  // Defines the prisma query and data mapping process
  params?: PrismaOneGenerateParams | PrismaTwoGenerateParams

  // pass true to forward the info input passed by the client
  includeInfo?: boolean

  // pass true to forward the orderBy input passed by the client
  includeOrderBy?: boolean
}

export interface DataloaderContext {
  dataloaders: Map<string, DataLoader<any, any>>
  getDataLoader: (options: LoaderParams) => DataLoader<any, any>
  req: Request<any>
  modelFieldsByModelName: any
}
