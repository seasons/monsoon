import { UpdatableConnection } from "@app/modules/index.types"
import { Injectable } from "@nestjs/common"

import { PrismaClient } from '@prisma/client'
import { PrismaSelect } from "@paljs/plugins"

const clientOptions = { 
  log: process.env.NODE_ENV === "production" ? ['warn', 'error'] : process.env.DB_LOG === 'true' ? ['query', 'info', 'warn', 'error'] : [] as any
}
const readClient = new PrismaClient({ ...clientOptions, datasources: { db: { url: process.env.DB_READ_URL }}})
const writeClient = new PrismaClient({ ...clientOptions, datasources: { db: { url: process.env.DB_WRITE_URL }}})

// We generate a client that routes reads to a read node, and writes to a write node
const generateSmartClient = (readClient: PrismaClient, writeClient: PrismaClient): PrismaClient => {
  const smartClient = {}
  const datamodel = new PrismaSelect(null).dataModel

  datamodel.forEach(model => {
    smartClient[model.name].aggregate = readClient[model.name].aggregate
    smartClient[model.name].count = readClient[model.name].count
    smartClient[model.name].findFirst = readClient[model.name].findFirst
    smartClient[model.name].findMany = readClient[model.name].findMany
    smartClient[model.name].findUnique = readClient[model.name].findUnique
    smartClient[model.name].groupBy = readClient[model.name].groupBy

    smartClient[model.name].create = writeClient[model.name].create
    smartClient[model.name].createMany = writeClient[model.name].createMany
    smartClient[model.name].delete = writeClient[model.name].delete
    smartClient[model.name].deleteMany = writeClient[model.name].deleteMany
    smartClient[model.name].update = writeClient[model.name].update
    smartClient[model.name].updateMany = writeClient[model.name].updateMany
    smartClient[model.name].upsert = writeClient[model.name].upsert
  })

  return smartClient as PrismaClient
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
    this.client = new PrismaClient({datasources: { db: { url: process.env.DB_WRITE_URL }}})
  }
}
