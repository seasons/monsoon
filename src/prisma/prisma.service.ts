import { UpdatableConnection } from "@app/modules/index.types"
import { Injectable } from "@nestjs/common"
import { PrismaSelect } from "@paljs/plugins"
import { PrismaClient } from "@prisma/client"
import { lowerFirst } from "lodash"

export type SmartPrismaClient = Omit<
  PrismaClient,
  "$executeRaw" | "$queryRaw" | "$on" | "$connect" | "$disconnect"
>

const clientOptions = {
  log:
    process.env.NODE_ENV === "production"
      ? ["warn", "error"]
      : process.env.DB_LOG === "true"
      ? ["query", "info", "warn", "error"]
      : ([] as any),
}
const readClient = new PrismaClient({
  ...clientOptions,
  datasources: { db: { url: process.env.DB_READ_URL } },
})
const writeClient = new PrismaClient({
  ...clientOptions,
  datasources: { db: { url: process.env.DB_WRITE_URL } },
})

// We generate a client that routes reads to a read node, and writes to a write node
const generateSmartClient = (
  readClient: PrismaClient,
  writeClient: PrismaClient
): SmartPrismaClient => {
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
      deleteMany,
      update,
      updateMany,
      upsert,
      create,
      createMany,
      delete: _delete, // typescript is unhappy if you destructure into a var named "delete"
    } = writeClient[keyName]

    smartClient[keyName] = {
      aggregate,
      count,
      findFirst,
      findMany,
      findUnique,
      groupBy,
      create,
      createMany,
      delete: _delete,
      deleteMany,
      update,
      updateMany,
      upsert,
    }
  })

  return smartClient
}

export const client = generateSmartClient(readClient, writeClient)

@Injectable()
export class PrismaService implements UpdatableConnection {
  client = client

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
}
