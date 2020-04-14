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

  updateConnection({
    PRISMA_SECRET,
    PRISMA_ENDPOINT,
  }: {
    PRISMA_SECRET: string
    PRISMA_ENDPOINT: string
  }) {
    this.binding = new PrismaBinding({
      secret: PRISMA_SECRET,
      endpoint: PRISMA_ENDPOINT,
      debug: false,
    })
    this.client = new PrismaClient({
      secret: PRISMA_SECRET,
      endpoint: PRISMA_ENDPOINT,
      debug: false,
    })
  }
}
