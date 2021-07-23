import tracer from "../tracer"

import { UpdatableConnection } from "@app/modules/index.types"
import { Injectable } from "@nestjs/common"

import { Prisma, PrismaClient as PrismaClient2 } from '@prisma/client'
import { PrismaSelect } from "@paljs/plugins"
import { head, intersection, isArray, uniq } from "lodash"

export const client2 = new PrismaClient2({ 
  log: process.env.NODE_ENV === "production" ? ['warn', 'error'] : process.env.DB_LOG === 'true' ? ['query', 'info', 'warn', 'error'] : []
})

client2.$use(async (params, next) => {
  const tags = {
    'span.kind': 'client',
    'span.type': 'sql',
    'prisma.model': params.model,
    'prisma.action': params.action
  }

  return tracer.trace('prisma.query', { tags }, () => next(params))
})

client2.$on('query' as any, async (e: any) => {
  const span = tracer.scope().active() // the span from above

  span?.setTag('resource.name', e.query)
});

export const SCALAR_LIST_FIELD_NAMES = {}

export const SINGLETON_RELATIONS_POSING_AS_ARRAYS = {}

// What was stored and interpreted as JSON in prisma1 will look like
// a string to prisma2 until we complete the migration
const JSON_FIELD_NAMES = {}

const MODELS_TO_SANITIZE = uniq([...Object.keys(JSON_FIELD_NAMES), ...Object.keys(SINGLETON_RELATIONS_POSING_AS_ARRAYS), ...Object.keys(SCALAR_LIST_FIELD_NAMES)])
@Injectable()
export class PrismaService implements UpdatableConnection {
  client2: PrismaClient2 = client2

  static modelFieldsByModelName = new PrismaSelect(null).dataModel.reduce(
    (accumulator, currentModel) => {
      accumulator[currentModel.name] = currentModel.fields
      return accumulator
    },
    {}
  )
  
  updateConnection({ secret, endpoint }: { secret: string; endpoint: string }) {
    this.client2 = new PrismaClient2()
  }
}
