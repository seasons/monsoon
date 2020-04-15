import { Injectable, Scope } from "@nestjs/common"
import { Prisma as PrismaClient, prisma } from "./"

import { Prisma as PrismaBinding } from "./prisma.binding"
import { UpdatableConnection } from "@app/modules/index.types"

@Injectable()
export class PrismaService implements UpdatableConnection {
  binding: PrismaBinding = new PrismaBinding({
    secret: process.env.PRISMA_SECRET,
    endpoint: process.env.PRISMA_ENDPOINT,
    debug: false,
  })
  client: PrismaClient = prisma

  updateConnection({ secret, endpoint }: { secret: string; endpoint: string }) {
    this.binding = new PrismaBinding({
      secret: secret,
      endpoint: endpoint,
      debug: false,
    })
    this.client = new PrismaClient({
      secret: secret,
      endpoint: endpoint,
      debug: false,
    })
  }
}
