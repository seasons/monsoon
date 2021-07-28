import { UpdatableConnection } from "@app/modules/index.types"
import { Injectable } from "@nestjs/common"

import { PrismaClient as PrismaClient2 } from '@prisma/client'
import { PrismaSelect } from "@paljs/plugins"

export const client: PrismaClient2 = new PrismaClient2({ 
log: process.env.NODE_ENV === "production" ? ['warn', 'error'] : process.env.DB_LOG === 'true' ? ['query', 'info', 'warn', 'error'] : []
})

@Injectable()
export class PrismaService implements UpdatableConnection {
  client2 = client
  
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
