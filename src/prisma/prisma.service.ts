import { UpdatableConnection } from "@app/modules/index.types"
import { Injectable } from "@nestjs/common"
import { PrismaSelect } from "@paljs/plugins"
import { Prisma, PrismaClient } from "@prisma/client"
import { lowerFirst } from "lodash"
import * as requestContext from "request-context"

export type SmartPrismaClient = Omit<
  PrismaClient,
  "$executeRaw" | "$queryRaw" | "$on" | "$connect" | "$disconnect"
>

// Prevent multiple instances of Prisma Client in development
declare const global: NodeJS.Global & {
  readClient?: PrismaClient
  writeClient?: PrismaClient
}
const clientOptions = {
  log:
    process.env.NODE_ENV === "production"
      ? ["warn", "error"]
      : process.env.DB_LOG === "true"
      ? ["query", "info", "warn", "error"]
      : ([] as any),
}
export const readClient =
  global.readClient ||
  new PrismaClient({
    ...clientOptions,
    datasources: { db: { url: process.env.DB_READ_URL } },
  })
export const writeClient =
  global.writeClient ||
  new PrismaClient({
    ...clientOptions,
    datasources: { db: { url: process.env.DB_WRITE_URL } },
  })
if (process.env.NODE_ENV === "development") {
  global.readClient = readClient
  global.writeClient = writeClient
}

@Injectable()
export class PrismaService implements UpdatableConnection {
  constructor() {
    this.client = this.generateSmartClient(readClient, writeClient)
  }

  client: SmartPrismaClient

  static modelFieldsByModelName = new PrismaSelect(null).dataModel.reduce(
    (accumulator, currentModel) => {
      accumulator[currentModel.name] = currentModel.fields
      return accumulator
    },
    {}
  )

  updateConnection({ secret, endpoint }: { secret: string; endpoint: string }) {
    this.client = new PrismaClient({
      datasources: { db: { url: process.env.DB_WRITE_URL } },
    })
  }

  // We generate a client that routes reads to a read node, and writes to a write node
  private generateSmartClient(
    readClient: PrismaClient,
    writeClient: PrismaClient
  ): SmartPrismaClient {
    const smartClient = {
      $transaction: args => writeClient.$transaction(args),
    } as SmartPrismaClient

    const datamodel = new PrismaSelect(null).dataModel
    datamodel.forEach(model => {
      const keyName = lowerFirst(model.name)

      const {
        aggregate,
        count,
        findFirst,
        findMany,
        findUnique,
        groupBy,
      } = readClient[keyName]

      const {
        aggregate: writeClientAggregate,
        count: writeClientCount,
        findFirst: writeClientFindFirst,
        findMany: writeClientFindMany,
        findUnique: writeClientFindUnique,
        groupBy: writeClientGroupBy,
        deleteMany,
        update,
        updateMany,
        upsert,
        create,
        createMany,
        delete: _delete, // typescript is unhappy if you destructure into a var named "delete"
      } = writeClient[keyName]

      smartClient[keyName] = {
        aggregate: this.createSmartReadFunc(
          aggregate,
          writeClientAggregate,
          clientOptions
        ),
        count: this.createSmartReadFunc(count, writeClientCount, clientOptions),
        findFirst: this.createSmartReadFunc(
          findFirst,
          writeClientFindFirst,
          clientOptions
        ),
        findMany: this.createSmartReadFunc(
          findMany,
          writeClientFindMany,
          clientOptions
        ),
        findUnique: this.createSmartReadFunc(
          findUnique,
          writeClientFindUnique,
          clientOptions
        ),
        groupBy: this.createSmartReadFunc(
          groupBy,
          writeClientGroupBy,
          clientOptions
        ),
        create: this.createSmartWriteFunc(create, clientOptions),
        createMany: this.createSmartWriteFunc(createMany, clientOptions),
        delete: this.createSmartWriteFunc(_delete, clientOptions),
        deleteMany: this.createSmartWriteFunc(deleteMany, clientOptions),
        update: this.createSmartWriteFunc(update, clientOptions),
        updateMany: this.createSmartWriteFunc(updateMany, clientOptions),
        upsert: this.createSmartWriteFunc(upsert, clientOptions),
      }
    })

    return smartClient
  }

  private createSmartReadFunc = (
    readClientFunc,
    writeClientFunc,
    { log }: { log: Array<Prisma.LogLevel> } = { log: [] }
  ) => {
    return args => {
      const requestOnMutation = this.requestIsOnMutation({ log })
      if (log.includes("info")) {
        console.log(`requestOnMutation: ${requestOnMutation}`)
      }

      if (requestOnMutation) {
        if (log.includes("info")) {
          console.log("use write client")
        }
        return writeClientFunc(args)
      }
      if (log.includes("info")) {
        console.log("use read client")
      }
      return readClientFunc(args)
    }
  }

  private createSmartWriteFunc = (
    func,
    { log }: { log: Array<Prisma.LogLevel> } = { log: [] }
  ) => {
    return args => {
      if (log.includes("info")) {
        console.log("use write client")
      }
      return func(args)
    }
  }

  private requestIsOnMutation(
    { log }: { log: Array<Prisma.LogLevel> } = { log: [] }
  ): Boolean {
    const context = requestContext.get("request:context")
    const queryString = requestContext.get("request:queryString")
    const isMutation = context?.isMutation || false

    if (log.includes("info")) {
      console.log(`queryString: ${queryString}`)
      console.log(`isMutation: ${isMutation}`)
    }

    return isMutation
  }
}
